import { describe, expect, it } from "vitest";
import { constructStripeEvent } from "@/lib/stripe-edge";

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
