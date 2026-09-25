import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMercadoPagoPreference,
  getMercadoPagoPayment,
  refundMercadoPagoPayment,
} from "@/lib/mercadopago";

describe("Mercado Pago Edge Library", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve criar uma preferencia com sucesso", async () => {
    const mockResponse = {
      id: "pref-123456",
      init_point: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-123456",
      sandbox_init_point: "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-123456",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createMercadoPagoPreference("fake-token", {
      items: [
        {
          id: "gastro_regular",
          title: "Plano Básico",
          quantity: 1,
          unit_price: 2100,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: "https://gastrointensivismo.com.br/login?success=true",
        failure: "https://gastrointensivismo.com.br/#planos",
        pending: "https://gastrointensivismo.com.br/login?pending=true",
      },
    });

    expect(result.id).toBe("pref-123456");
    expect(result.init_point).toContain("mercadopago.com.br");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.mercadopago.com/checkout/preferences",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("deve buscar status de um pagamento", async () => {
    const mockPayment = {
      id: 99887766,
      status: "approved",
      status_detail: "accredited",
      payer: {
        email: "aluno@teste.com",
        first_name: "Dr. Aluno",
      },
      metadata: {
        plan: "elite",
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayment,
    });

    const payment = await getMercadoPagoPayment("fake-token", 99887766);
    expect(payment.id).toBe(99887766);
    expect(payment.status).toBe("approved");
    expect(payment.payer?.email).toBe("aluno@teste.com");
  });

  it("deve estornar um pagamento com sucesso e incluir X-Idempotency-Key", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 554433, status: "approved" }),
    });

    const refund = await refundMercadoPagoPayment("fake-token", 99887766);
    expect(refund.id).toBe(554433);
    expect(refund.status).toBe("approved");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.mercadopago.com/v1/payments/99887766/refunds",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
          "X-Idempotency-Key": expect.any(String),
        }),
      })
    );
  });
});
