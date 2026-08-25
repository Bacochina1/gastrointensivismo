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
  const origin = new URL(req.url).origin;
  const isElite = planType === "elite";
  
  const productName = isElite 
    ? "Gastrointensivismo - Plano Premium" 
    : "Gastrointensivismo - Plano Básico";
    
  const defaultAmount = isElite ? "285000" : "210000";
  // Se STRIPE_UNIT_AMOUNT foi definido manualmente para testes (ex: 50 para R$ 0,50), usa ele
  const unitAmount = env.STRIPE_UNIT_AMOUNT || defaultAmount;

  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/login?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#planos`,
    "metadata[product]": isElite ? "gastro_elite" : "gastro_regular",
    "metadata[plan]": isElite ? "elite" : "regular",
    "line_items[0][quantity]": "1",
  });

  if (env.STRIPE_PRICE_ID && !isElite) {
    params.set("line_items[0][price]", env.STRIPE_PRICE_ID);
  } else {
    params.set("payment_method_types[0]", "card");
    params.set("line_items[0][price_data][currency]", "brl");
    params.set(
      "line_items[0][price_data][unit_amount]",
      unitAmount
    );
    params.set(
      "line_items[0][price_data][product_data][name]",
      productName
    );
  }

  const session = await createCheckoutSession(secretKey, params);
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
      { error: "Nao foi possivel iniciar o pagamento. Tente novamente." },
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
