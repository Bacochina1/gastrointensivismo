export interface StripeCheckoutSession {
  id: string;
  status?: string | null;
  payment_status?: string | null;
  customer?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  metadata?: Record<string, string | undefined> | null;
  url?: string | null;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession & Record<string, unknown>;
  };
}

interface StripeErrorResponse {
  error?: { message?: string };
}

async function stripeRequest<T>(
  path: string,
  secretKey: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`https://api.stripe.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...init?.headers,
    },
  });

  const payload = (await response.json()) as T & StripeErrorResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || `Stripe respondeu HTTP ${response.status}`);
  }

  return payload;
}

export async function createCheckoutSession(
  secretKey: string,
  params: URLSearchParams
): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>("/v1/checkout/sessions", secretKey, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
}

export async function retrieveCheckoutSession(
  secretKey: string,
  sessionId: string
): Promise<StripeCheckoutSession> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    throw new Error("Identificador de Checkout invalido");
  }

  return stripeRequest<StripeCheckoutSession>(
    `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    secretKey
  );
}

function parseStripeSignature(header: string) {
  const parts = header.split(",");
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  const timestamp = Number(timestampPart?.slice(2));

  if (!Number.isFinite(timestamp) || signatures.length === 0) {
    throw new Error("Cabecalho stripe-signature invalido");
  }

  return { timestamp, signatures };
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

async function hmacSha256Hex(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function constructStripeEvent(
  payload: string,
  signatureHeader: string,
  webhookSecret: string,
  toleranceSeconds = 300
): Promise<StripeEvent> {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);

  if (age > toleranceSeconds) {
    throw new Error("Assinatura Stripe expirada");
  }

  const expected = await hmacSha256Hex(`${timestamp}.${payload}`, webhookSecret);
  if (!signatures.some((signature) => constantTimeEqual(signature, expected))) {
    throw new Error("Assinatura Stripe invalida");
  }

  return JSON.parse(payload) as StripeEvent;
}
