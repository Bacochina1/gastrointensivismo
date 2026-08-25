import { NextResponse } from "next/server";
import { getRuntimeEnv } from "@/lib/cloudflare-env";
import { hashPassword } from "@/lib/auth-utils";
import { sendWelcomeEmail } from "@/lib/email";
import {
  constructStripeEvent,
  type StripeCheckoutSession,
} from "@/lib/stripe-edge";

export const dynamic = "force-dynamic";

interface ExistingUser {
  id: string;
  password_hash?: string | null;
}

interface RefundObject {
  billing_details?: { email?: string | null } | null;
  receipt_email?: string | null;
  customer_email?: string | null;
  customer?: string | null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const env = getRuntimeEnv();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET nao configurado.");
    return NextResponse.json({ error: "Webhook nao configurado" }, { status: 503 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  if (!env.DB) {
    console.error("[Stripe Webhook] Binding DB nao configurado.");
    return NextResponse.json({ error: "Banco indisponivel" }, { status: 503 });
  }

  let event;
  try {
    event = await constructStripeEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assinatura invalida";
    console.warn("[Stripe Webhook] Evento rejeitado:", message);
    return NextResponse.json({ error: "Assinatura invalida" }, { status: 400 });
  }

  const db = env.DB;
  const origin = "https://gastrointensivismo.com.br";

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as StripeCheckoutSession;

      if (session.payment_status !== "paid") {
        console.info(
          `[Stripe Webhook] Evento ${event.id} ainda sem pagamento confirmado.`
        );
        return NextResponse.json({ received: true });
      }
      const customerEmail = session.customer_details?.email || session.customer_email;
      const customerName =
        session.customer_details?.name || "Aluno Gastrointensivismo";

      if (!customerEmail) {
        console.warn(`[Stripe Webhook] Evento ${event.id} sem e-mail do cliente.`);
        return NextResponse.json({ received: true });
      }

      const normalizedEmail = customerEmail.toLowerCase().trim();
      const checkStmt = db.prepare(
        "SELECT id, password_hash FROM Users WHERE email = ?"
      );
      const existingUser = await checkStmt
        .bind(normalizedEmail)
        .first<ExistingUser>();

      let tempPassword: string | undefined;
      let tempPasswordHash: string | undefined;

      if (!existingUser?.password_hash) {
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        tempPassword = `Gastro#${randomCode}!`;
        tempPasswordHash = await hashPassword(tempPassword);
      }

      if (existingUser) {
        if (tempPasswordHash) {
          const updateStmt = db.prepare(
            "UPDATE Users SET has_access = 1, password_hash = ?, must_change_password = 1, stripe_id = ? WHERE email = ?"
          );
          await updateStmt
            .bind(
              tempPasswordHash,
              session.customer || session.id,
              normalizedEmail
            )
            .run();
        } else {
          const updateStmt = db.prepare(
            "UPDATE Users SET has_access = 1, stripe_id = ? WHERE email = ?"
          );
          await updateStmt
            .bind(session.customer || session.id, normalizedEmail)
            .run();
        }
      } else {
        const userId = crypto.randomUUID();
        const insertStmt = db.prepare(
          "INSERT INTO Users (id, name, email, password_hash, has_access, must_change_password, stripe_id) VALUES (?, ?, ?, ?, 1, 1, ?)"
        );
        await insertStmt
          .bind(
            userId,
            customerName,
            normalizedEmail,
            tempPasswordHash,
            session.customer || session.id
          )
          .run();
      }

      if (tempPassword) {
        const emailResult = await sendWelcomeEmail({
          to: normalizedEmail,
          name: customerName,
          tempPassword,
          loginUrl: `${origin}/login?email=${encodeURIComponent(normalizedEmail)}&temp=true`,
        });

        if (!emailResult.success) {
          console.error(`[Stripe Webhook] Falha ao enviar acesso para ${normalizedEmail}.`);
          return NextResponse.json({ error: "Falha no envio do acesso" }, { status: 500 });
        }
      }
    }

    if (
      event.type === "charge.refunded" ||
      event.type === "charge.dispute.created" ||
      event.type === "customer.subscription.deleted"
    ) {
      const charge = event.data.object as RefundObject;
      const customerEmail =
        charge.billing_details?.email ||
        charge.receipt_email ||
        charge.customer_email;

      if (customerEmail) {
        const revokeStmt = db.prepare(
          "UPDATE Users SET has_access = 0 WHERE email = ?"
        );
        await revokeStmt.bind(customerEmail.toLowerCase().trim()).run();
      } else if (charge.customer) {
        const revokeStmt = db.prepare(
          "UPDATE Users SET has_access = 0 WHERE stripe_id = ?"
        );
        await revokeStmt.bind(charge.customer).run();
      }
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Falha ao processar ${event.id}:`, error);
    return NextResponse.json({ error: "Falha ao processar evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
