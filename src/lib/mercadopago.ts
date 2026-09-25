/**
 * Mercado Pago Edge Integration (native fetch, 100% Cloudflare Workers compatible)
 */

export interface MercadoPagoPaymentItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MercadoPagoPreferenceRequest {
  items: MercadoPagoPaymentItem[];
  payer?: {
    name?: string;
    email?: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: "approved" | "all";
  metadata?: Record<string, string>;
  notification_url?: string;
  payment_methods?: {
    installments?: number;
    default_installments?: number;
  };
  statement_descriptor?: string;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  [key: string]: unknown;
}

export interface MercadoPagoPayment {
  id: number;
  status: "approved" | "pending" | "in_process" | "rejected" | "cancelled" | "refunded" | "charged_back";
  status_detail: string;
  date_approved?: string | null;
  transaction_amount?: number;
  payer?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
  };
  metadata?: {
    plan?: string;
    product?: string;
    [key: string]: unknown;
  };
  external_reference?: string;
}

export async function createMercadoPagoPreference(
  accessToken: string,
  params: MercadoPagoPreferenceRequest
): Promise<MercadoPagoPreferenceResponse> {
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = (data as any)?.message || `Mercado Pago HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as MercadoPagoPreferenceResponse;
}

export async function getMercadoPagoPayment(
  accessToken: string,
  paymentId: string | number
): Promise<MercadoPagoPayment> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = (data as any)?.message || `Erro ao buscar pagamento ${paymentId} no Mercado Pago`;
    throw new Error(errorMsg);
  }

  return data as MercadoPagoPayment;
}

export async function refundMercadoPagoPayment(
  accessToken: string,
  paymentId: string | number,
  amount?: number
): Promise<{ id: number; status: string }> {
  const body = amount ? JSON.stringify({ amount }) : undefined;
  const idempotencyKey = crypto.randomUUID();
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = (data as any)?.message || `Erro ao reembolsar pagamento ${paymentId} no Mercado Pago`;
    throw new Error(errorMsg);
  }

  return data as { id: number; status: string };
}
