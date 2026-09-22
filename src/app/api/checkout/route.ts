export const dynamic = "force-dynamic";

import { getRuntimeEnv } from "@/lib/cloudflare-env";
import { createCheckoutSession } from "@/lib/stripe-edge";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

async function buildSessionUrl(req: Request, planType: string = "regular"): Promise<string> {
  const env = getRuntimeEnv();
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY nao configurada no ambiente");
  }
  const origin = req.url.includes("localhost") ? new URL(req.url).origin : "https://gastrointensivismo.com.br";
  const isElite = planType === "elite";

  const productName = isElite
    ? "Gastrointensivismo - Plano Premium (Formação Avançada + Mentoria)"
    : "Gastrointensivismo - Plano Básico";

  const productDescription = isElite
    ? "12x de R$ 237,50 sem juros ou R$ 2.850 à vista (25% OFF de lançamento). 6 meses de acesso às 30 aulas, banco de questões, 30 TEGs comentados, grupos exclusivos e Mentoria direta."
    : "12x de R$ 175,00 sem juros ou R$ 2.100 à vista (25% OFF de lançamento). 6 meses de acesso às 30 aulas, banco de questões, 30 TEGs comentados e grupo de atualizações no Telegram.";

  // Valores oficiais e definitivos:
  // Plano Básico: R$ 2.100,00 (210000 centavos) -> 12x de R$ 175,00
  // Plano Premium: R$ 2.850,00 (285000 centavos) -> 12x de R$ 237,50
  const unitAmount = isElite ? "285000" : "210000";

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
    "line_items[0][price_data][unit_amount]": unitAmount,
    "line_items[0][price_data][product_data][name]": productName,
    "line_items[0][price_data][product_data][description]": productDescription,
    "payment_method_options[card][installments][enabled]": "true",
  });

  // Tenta criar com Card + Pix primeiro. Se a conta Stripe nao tiver Pix ativo, cai para Card sem quebrar
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
