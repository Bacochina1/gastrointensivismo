export const dynamic = "force-dynamic";

import { getRuntimeEnv } from "@/lib/cloudflare-env";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { createCheckoutSession } from "@/lib/stripe-edge";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

async function buildSessionUrl(req: Request, planType: string = "regular"): Promise<string> {
  const env = getRuntimeEnv();
  // Mercado Pago exige HTTPS para back_urls com auto_return
  const origin = "https://gastrointensivismo.com.br";
  const isElite = planType === "elite";

  const productName = isElite
    ? "Gastrointensivismo - Plano Premium (Formação Avançada + Mentoria)"
    : "Gastrointensivismo - Plano Básico";

  const productDescription = isElite
    ? "12x de R$ 237,50 sem juros ou R$ 2.850 à vista (25% OFF de lançamento). 6 meses de acesso às 30 aulas, banco de questões, 30 TEGs comentados, grupos exclusivos e Mentoria direta."
    : "12x de R$ 175,00 sem juros ou R$ 2.100 à vista (25% OFF de lançamento). 6 meses de acesso às 30 aulas, banco de questões, 30 TEGs comentados e grupo de atualizações no Telegram.";

  // Se houver override de teste ativo (ex: R$ 1,00 para teste real)
  const testOverride = env.TEST_PRICE_OVERRIDE ? parseFloat(env.TEST_PRICE_OVERRIDE) : null;
  const unitAmountFloat = testOverride !== null && !isNaN(testOverride)
    ? testOverride
    : (isElite ? 2850.0 : 2100.0);
  const unitAmountCentavos = String(Math.round(unitAmountFloat * 100));

  if (testOverride !== null) {
    console.info(`[Checkout] AVISO: Preco em MODO DE TESTE REAL ativo: R$ ${unitAmountFloat.toFixed(2)}`);
  }

  // 1. Se Mercado Pago estiver configurado, usa Checkout Pro do Mercado Pago (Pix + Cartão 12x)
  const mpToken = env.MERCADO_PAGO_ACCESS_TOKEN;
  if (mpToken) {
    try {
      const preference = await createMercadoPagoPreference(mpToken, {
        items: [
          {
            id: isElite ? "gastro_elite" : "gastro_regular",
            title: productName,
            description: productDescription,
            quantity: 1,
            unit_price: unitAmountFloat,
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${origin}/login?success=true`,
          failure: `${origin}/#planos`,
          pending: `${origin}/login?pending=true`,
        },
        auto_return: "approved",
        metadata: {
          product: isElite ? "gastro_elite" : "gastro_regular",
          plan: isElite ? "elite" : "regular",
        },
        notification_url: `${origin}/api/webhooks/mercadopago`,
        payment_methods: {
          installments: 12,
        },
        statement_descriptor: "GASTROINTENSIVISMO",
      });

      // Em ambiente de teste/sandbox usa sandbox_init_point se disponível
      const isTest = mpToken.startsWith("TEST-") || mpToken.includes("TESTUSER");
      const checkoutUrl = (isTest && preference.sandbox_init_point) ? preference.sandbox_init_point : preference.init_point;

      if (!checkoutUrl) {
        throw new Error("Mercado Pago nao retornou init_point");
      }

      return checkoutUrl;
    } catch (mpErr) {
      console.error("[Checkout] Erro ao criar preferencia no Mercado Pago:", mpErr);
      if (!env.STRIPE_SECRET_KEY) {
        throw mpErr;
      }
      // Se falhar e tiver Stripe, continua para fallback Stripe
    }
  }

  // 2. Fallback para Stripe
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Nenhum gateway de pagamento configurado (Mercado Pago ou Stripe)");
  }

  const baseParams = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/login?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#planos`,
    "phone_number_collection[enabled]": "true",
    "invoice_creation[enabled]": "true",
    "metadata[product]": isElite ? "gastro_elite" : "gastro_regular",
    "metadata[plan]": isElite ? "elite" : "regular",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "brl",
    "line_items[0][price_data][unit_amount]": unitAmountCentavos,
    "line_items[0][price_data][product_data][name]": productName,
    "line_items[0][price_data][product_data][description]": productDescription,
    "payment_method_options[card][installments][enabled]": "true",
  });

  let session;
  try {
    const pixParams = new URLSearchParams(baseParams);
    pixParams.set("payment_method_types[0]", "card");
    pixParams.set("payment_method_types[1]", "pix");
    session = await createCheckoutSession(secretKey, pixParams);
  } catch (err) {
    console.warn("[Checkout] Pix nao disponivel na conta Stripe, usando apenas card:", err);
    const cardParams = new URLSearchParams(baseParams);
    cardParams.set("payment_method_types[0]", "card");
    session = await createCheckoutSession(secretKey, cardParams);
  }

  if (!session.url) {
    throw new Error("Stripe nao retornou a URL de checkout");
  }

  return session.url;
}

export async function POST(req: Request) {
  try {
    let plan = "regular";
    try {
      const body = await req.json();
      if (body?.plan === "elite") plan = "elite";
    } catch {}

    const url = await buildSessionUrl(req, plan);
    return Response.json({ url }, { headers: JSON_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[Checkout POST]", message);
    return Response.json(
      { error: "Nao foi possivel iniciar o pagamento. Tente novamente.", details: message },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = await buildSessionUrl(req);
    return new Response(null, {
      status: 303,
      headers: { Location: url },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[Checkout GET]", message);
    return new Response(`Erro ao redirecionar para checkout: ${message}`, { status: 500 });
  }
}
