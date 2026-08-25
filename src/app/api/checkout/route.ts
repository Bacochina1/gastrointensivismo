export const runtime = "edge";
export const dynamic = "force-dynamic";

import { getRuntimeEnv } from "@/lib/cloudflare-env";
import { createCheckoutSession } from "@/lib/stripe-edge";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

async function buildSessionUrl(req: Request): Promise<string> {
  const env = getRuntimeEnv();
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY nao configurada no ambiente");
  }
  const origin = new URL(req.url).origin;
  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/login?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#planos`,
    "metadata[product]": "gastro_regular",
    "line_items[0][quantity]": "1",
  });

  if (env.STRIPE_PRICE_ID) {
    params.set("line_items[0][price]", env.STRIPE_PRICE_ID);
  } else {
    params.set("payment_method_types[0]", "card");
    params.set("line_items[0][price_data][currency]", "brl");
    params.set(
      "line_items[0][price_data][unit_amount]",
      env.STRIPE_UNIT_AMOUNT || "50"
    );
    params.set(
      "line_items[0][price_data][product_data][name]",
      "Gastrointensivismo 2026"
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
    const url = await buildSessionUrl(req);
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
