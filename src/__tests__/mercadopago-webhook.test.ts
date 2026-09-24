import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/mercadopago/route";
import * as cloudflareEnv from "@/lib/cloudflare-env";
import * as mpLib from "@/lib/mercadopago";
import * as emailLib from "@/lib/email";

describe("Mercado Pago Webhook Handler", () => {
  let mockDb: any;
  let mockUsers: Map<string, any>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockUsers = new Map();

    mockDb = {
      prepare: vi.fn((query: string) => {
        return {
          bind: vi.fn((...args: any[]) => {
            return {
              first: vi.fn(async () => {
                if (query.includes("SELECT id, password_hash FROM Users")) {
                  const email = args[0];
                  return mockUsers.get(email) || null;
                }
                return null;
              }),
              run: vi.fn(async () => {
                if (query.includes("INSERT INTO Users")) {
                  const [id, name, email, phone, password_hash, stripe_id, plan] = args;
                  mockUsers.set(email, {
                    id,
                    name,
                    email,
                    phone,
                    password_hash,
                    has_access: 1,
                    stripe_id,
                    plan,
                  });
                } else if (query.includes("UPDATE Users SET has_access = 0")) {
                  const [email] = args;
                  const u = mockUsers.get(email);
                  if (u) u.has_access = 0;
                } else if (query.includes("UPDATE Users SET has_access = 1")) {
                  // update
                  const email = args[args.length - 1];
                  const u = mockUsers.get(email);
                  if (u) u.has_access = 1;
                }
                return { success: true };
              }),
            };
          }),
        };
      }),
    };

    vi.spyOn(cloudflareEnv, "getRuntimeEnv").mockReturnValue({
      DB: mockDb,
      MERCADO_PAGO_ACCESS_TOKEN: "mock_mp_token",
    } as any);

    vi.spyOn(emailLib, "sendWelcomeEmail").mockResolvedValue({ success: true } as any);
    vi.spyOn(emailLib, "sendNewSaleAdminNotification").mockResolvedValue(undefined as any);
  });

  it("deve criar novo aluno e enviar email ao receber pagamento aprovado", async () => {
    vi.spyOn(mpLib, "getMercadoPagoPayment").mockResolvedValue({
      id: 123456789,
      status: "approved",
      status_detail: "accredited",
      payer: {
        email: "novo.aluno@hospital.com.br",
        first_name: "Carlos",
        last_name: "Silva",
        phone: { number: "11999999999" },
      },
      metadata: {
        plan: "elite",
        product: "gastro_elite",
      },
    } as any);

    const req = new Request("https://gastrointensivismo.com.br/api/webhooks/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "payment.created",
        data: { id: "123456789" },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);

    // Verifica se aluno foi inserido
    const savedUser = mockUsers.get("novo.aluno@hospital.com.br");
    expect(savedUser).toBeDefined();
    expect(savedUser.name).toBe("Carlos Silva");
    expect(savedUser.plan).toBe("elite");
    expect(savedUser.has_access).toBe(1);
    expect(savedUser.stripe_id).toBe("123456789");

    // Verifica envio de email de boas-vindas
    expect(emailLib.sendWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "novo.aluno@hospital.com.br",
        name: "Carlos Silva",
      })
    );
  });

  it("deve revogar acesso do aluno ao receber estorno/refund", async () => {
    // Aluno já existe com acesso
    mockUsers.set("aluno.estornado@hospital.com.br", {
      id: "u-999",
      email: "aluno.estornado@hospital.com.br",
      has_access: 1,
      stripe_id: "888777",
    });

    vi.spyOn(mpLib, "getMercadoPagoPayment").mockResolvedValue({
      id: 888777,
      status: "refunded",
      status_detail: "refunded",
      payer: {
        email: "aluno.estornado@hospital.com.br",
      },
    } as any);

    const req = new Request("https://gastrointensivismo.com.br/api/webhooks/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "payment.updated",
        data: { id: "888777" },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const user = mockUsers.get("aluno.estornado@hospital.com.br");
    expect(user.has_access).toBe(0);
  });
});
