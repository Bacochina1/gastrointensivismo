import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { constructStripeEvent, createStripeRefund } from "@/lib/stripe-edge";

async function sign(payload: string, timestamp: number, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const result = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${payload}`)
  );
  return Array.from(new Uint8Array(result))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

describe("Assinatura de webhook Stripe", () => {
  it("aceita um evento assinado corretamente", async () => {
    const payload = JSON.stringify({
      id: "evt_test_123",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123" } },
    });
    const secret = "whsec_unit_test";
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await sign(payload, timestamp, secret);

    const event = await constructStripeEvent(
      payload,
      `t=${timestamp},v1=${signature}`,
      secret
    );

    expect(event.id).toBe("evt_test_123");
  });

  it("rejeita assinatura incorreta", async () => {
    const timestamp = Math.floor(Date.now() / 1000);

    await expect(
      constructStripeEvent(
        JSON.stringify({ id: "evt_invalid", data: { object: {} } }),
        `t=${timestamp},v1=${"0".repeat(64)}`,
        "whsec_unit_test"
      )
    ).rejects.toThrow("Assinatura Stripe invalida");
  });
});

describe("Reembolso na Stripe (createStripeRefund)", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("reembolsa a partir de um Checkout Session ID (cs_...)", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/checkout/sessions/cs_test_abc123")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: "cs_test_abc123", payment_intent: "pi_test_999" }),
        });
      }
      if (url.includes("/v1/refunds")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: "re_test_555", status: "succeeded", amount: 285000 }),
        });
      }
      return Promise.reject(new Error("URL desconhecida: " + url));
    });

    globalThis.fetch = fetchMock;

    const res = await createStripeRefund("sk_test_mock", "cs_test_abc123", "requested_by_customer");
    expect(res.id).toBe("re_test_555");
    expect(res.status).toBe("succeeded");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reembolsa diretamente a partir de um PaymentIntent ID (pi_...)", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/refunds")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: "re_test_777", status: "succeeded", amount: 210000 }),
        });
      }
      return Promise.reject(new Error("URL desconhecida: " + url));
    });

    globalThis.fetch = fetchMock;

    const res = await createStripeRefund("sk_test_mock", "pi_test_888");
    expect(res.id).toBe("re_test_777");
    expect(res.status).toBe("succeeded");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
