import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1Binding {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      all: <T = unknown>() => Promise<{ results?: T[] }>;
      first: <T = unknown>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
  };
}

export interface CloudflareEnv {
  DB?: D1Binding;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID?: string;
  STRIPE_UNIT_AMOUNT?: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ALLOW_INSECURE_DEV_AUTH?: string;
}

export function getRuntimeEnv(): CloudflareEnv {
  let cfEnv: CloudflareEnv = {};
  try {
    const ctx = getCloudflareContext();
    if (ctx && ctx.env) {
      cfEnv = ctx.env as unknown as CloudflareEnv;
    }
  } catch {}

  const procEnv =
    typeof process !== "undefined" && process.env
      ? (process.env as unknown as CloudflareEnv)
      : {};

  return {
    ...procEnv,
    ...cfEnv,
  };
}

export function requireEnv(name: keyof CloudflareEnv): string {
  const env = getRuntimeEnv();
  const value = env[name];

  if (!value || typeof value !== "string") {
    throw new Error(`Variavel obrigatoria nao configurada: ${name}`);
  }

  return value;
}
