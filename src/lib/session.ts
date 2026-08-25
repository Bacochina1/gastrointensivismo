// Session & Security Token Helper via Web Crypto HMAC-SHA256
import { getRuntimeEnv } from "@/lib/cloudflare-env";

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  hasAccess: boolean;
  exp: number;
}

export interface ResetTokenPayload {
  email: string;
  type: "password_reset";
  nonce: string;
  exp: number;
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 dias de validade
  const fullPayload: SessionPayload = { ...payload, exp };
  
  const payloadBase64 = btoa(JSON.stringify(fullPayload));
  const signature = await generateSignature(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;

  const [payloadBase64, signature] = token.split(".");
  const expectedSignature = await generateSignature(payloadBase64);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null; // Token adulterado!
  }

  try {
    const payload: SessionPayload = JSON.parse(atob(payloadBase64));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expirado!
    }
    return payload;
  } catch {
    return null;
  }
}

// Gera token de recuperação de senha com validade estrita de 1 hora
export async function createPasswordResetToken(email: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hora (3600s)
  const nonce = crypto.randomUUID();
  const payload: ResetTokenPayload = {
    email: email.toLowerCase().trim(),
    type: "password_reset",
    nonce,
    exp,
  };

  const payloadBase64 = btoa(JSON.stringify(payload));
  const signature = await generateSignature(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

// Valida a assinatura e expiração do token de recuperação
export async function verifyPasswordResetToken(token: string, expectedEmail: string): Promise<boolean> {
  if (!token || !token.includes(".")) return false;

  const [payloadBase64, signature] = token.split(".");
  const expectedSignature = await generateSignature(payloadBase64);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return false; // Assinatura inválida
  }

  try {
    const payload: ResetTokenPayload = JSON.parse(atob(payloadBase64));
    if (payload.type !== "password_reset") return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false; // Expirado
    if (payload.email !== expectedEmail.toLowerCase().trim()) return false; // E-mail divergente

    return true;
  } catch {
    return false;
  }
}

async function generateSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const env = getRuntimeEnv();
  const sessionSecret = env.NEXTAUTH_SECRET || "gastro_secret_key_prod_2026_super_secure_medcof_gastro";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function getSessionTokenFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("gastro_session="));

  return cookie?.slice("gastro_session=".length);
}

export function createSessionCookie(token: string): string {
  return `gastro_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}

export function clearSessionCookie(): string {
  return "gastro_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
