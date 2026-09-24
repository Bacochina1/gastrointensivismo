import { NextResponse } from "next/server";
import { getRuntimeEnv } from "@/lib/cloudflare-env";
import { hashPassword } from "@/lib/auth-utils";
import { sendWelcomeEmail, sendNewSaleAdminNotification } from "@/lib/email";
import { getMercadoPagoPayment } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

interface ExistingUser {
  id: string;
  password_hash?: string | null;
}

export async function POST(req: Request) {
  const env = getRuntimeEnv();
  const mpToken = env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!mpToken) {
    console.error("[Mercado Pago Webhook] MERCADO_PAGO_ACCESS_TOKEN nao configurado.");
    return NextResponse.json({ error: "Webhook nao configurado" }, { status: 503 });
  }

  if (!env.DB) {
    console.error("[Mercado Pago Webhook] Binding DB nao configurado.");
    return NextResponse.json({ error: "Banco indisponivel" }, { status: 503 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const url = new URL(req.url);
  // Mercado Pago pode enviar ID pelo body (webhooks v2) ou pela query string (IPN)
  const paymentId =
    body?.data?.id ||
    body?.id ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("id");

  const topicOrType =
    body?.type ||
    body?.action ||
    url.searchParams.get("type") ||
    url.searchParams.get("topic");

  console.info(`[Mercado Pago Webhook] Recebido evento: ${topicOrType} para id: ${paymentId}`);

  // Se nao tiver paymentId ou for evento de teste sem id, responde 200 OK
  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  // Verifica se o evento se refere a pagamento
  const isPaymentEvent =
    !topicOrType ||
    topicOrType.includes("payment") ||
    topicOrType.includes("payment.created") ||
    topicOrType.includes("payment.updated");

  if (!isPaymentEvent) {
    return NextResponse.json({ received: true });
  }

  const db = env.DB;
  const origin = "https://gastrointensivismo.com.br";

  try {
    // Consulta direta à API oficial do Mercado Pago usando nosso Access Token autenticado
    const payment = await getMercadoPagoPayment(mpToken, paymentId);

    console.info(
      `[Mercado Pago Webhook] Pagamento ${payment.id} status: ${payment.status} (${payment.status_detail})`
    );

    // 1. PAGAMENTO APROVADO
    if (payment.status === "approved") {
      const customerEmail = payment.payer?.email;

      // Nome: busca no payer, no additional_info ou no titular do cartao
      const addInfoPayer = (payment as any)?.additional_info?.payer;
      const firstName = payment.payer?.first_name || addInfoPayer?.first_name || "";
      const lastName = payment.payer?.last_name || addInfoPayer?.last_name || "";
      let customerName = `${firstName} ${lastName}`.trim();
      if (!customerName && (payment as any)?.card?.cardholder?.name) {
        customerName = (payment as any).card.cardholder.name;
      }
      if (!customerName) {
        customerName = "Aluno Gastrointensivismo";
      }

      // Telefone: junta DDD (area_code) com o numero para WhatsApp
      const phoneObj = payment.payer?.phone || addInfoPayer?.phone;
      let customerPhone: string | null = null;
      if (phoneObj) {
        const ddd = phoneObj.area_code ? `(${phoneObj.area_code}) ` : "";
        const num = phoneObj.number || "";
        customerPhone = `${ddd}${num}`.trim() || null;
      }

      if (!customerEmail) {
        console.warn(`[Mercado Pago Webhook] Pagamento ${payment.id} sem e-mail do pagador.`);
        return NextResponse.json({ received: true });
      }

      const normalizedEmail = customerEmail.toLowerCase().trim();
      const checkStmt = db.prepare(
        "SELECT id, password_hash FROM Users WHERE LOWER(TRIM(email)) = ?"
      );
      const existingUser = await checkStmt.bind(normalizedEmail).first<ExistingUser>();

      let tempPassword: string | undefined;
      let tempPasswordHash: string | undefined;

      if (!existingUser?.password_hash) {
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        tempPassword = `Gastro#${randomCode}!`;
        tempPasswordHash = await hashPassword(tempPassword);
      }

      const plan =
        payment.metadata?.plan === "elite" || payment.metadata?.product === "gastro_elite"
          ? "elite"
          : "regular";

      const paymentReference = String(payment.id);

      if (existingUser) {
        if (tempPasswordHash) {
          await db
            .prepare(
              "UPDATE Users SET has_access = 1, plan = ?, password_hash = ?, must_change_password = 1, stripe_id = ?, phone = COALESCE(?, phone) WHERE LOWER(TRIM(email)) = ?"
            )
            .bind(plan, tempPasswordHash, paymentReference, customerPhone, normalizedEmail)
            .run();
        } else {
          await db
            .prepare(
              "UPDATE Users SET has_access = 1, plan = ?, stripe_id = ?, phone = COALESCE(?, phone) WHERE LOWER(TRIM(email)) = ?"
            )
            .bind(plan, paymentReference, customerPhone, normalizedEmail)
            .run();
        }
      } else {
        const userId = crypto.randomUUID();
        await db
          .prepare(
            "INSERT INTO Users (id, name, email, phone, password_hash, has_access, must_change_password, stripe_id, plan) VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)"
          )
          .bind(
            userId,
            customerName,
            normalizedEmail,
            customerPhone,
            tempPasswordHash,
            paymentReference,
            plan
          )
          .run();
      }

      // Notifica admin de nova venda aprovada
      sendNewSaleAdminNotification({
        name: customerName,
        email: normalizedEmail,
        phone: customerPhone,
        plan,
      }).catch(err => console.error("[Mercado Pago Webhook] Erro ao notificar admin:", err));

      // Envia e-mail com senha temporaria se for novo usuario
      if (tempPassword) {
        const emailResult = await sendWelcomeEmail({
          to: normalizedEmail,
          name: customerName,
          tempPassword,
          loginUrl: `${origin}/login?email=${encodeURIComponent(normalizedEmail)}&temp=true`,
        });

        if (!emailResult.success) {
          console.error(`[Mercado Pago Webhook] Falha ao enviar acesso para ${normalizedEmail}.`);
        }
      }
    }

    // 2. REEMBOLSO OU CHARGEBACK
    if (
      payment.status === "refunded" ||
      payment.status === "charged_back" ||
      payment.status === "cancelled"
    ) {
      const paymentReference = String(payment.id);
      const customerEmail = payment.payer?.email?.toLowerCase().trim();

      if (customerEmail) {
        await db
          .prepare("UPDATE Users SET has_access = 0 WHERE LOWER(TRIM(email)) = ? OR stripe_id = ?")
          .bind(customerEmail, paymentReference)
          .run();
      } else {
        await db
          .prepare("UPDATE Users SET has_access = 0 WHERE stripe_id = ?")
          .bind(paymentReference)
          .run();
      }
      console.info(`[Mercado Pago Webhook] Acesso revogado para pagamento ${payment.id}`);
    }
  } catch (error) {
    console.error(`[Mercado Pago Webhook] Erro ao processar pagamento ${paymentId}:`, error);
  }

  // Responde sempre 200 OK para o Mercado Pago confirmar o recebimento
  return NextResponse.json({ received: true });
}

// Suporte para chamadas GET (usadas pelo IPN do Mercado Pago para teste de webhook)
export async function GET() {
  return NextResponse.json({ status: "Mercado Pago Webhook ativo" });
}
