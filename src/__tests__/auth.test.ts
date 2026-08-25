import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";

describe("Autenticação e Hash de Senha", () => {
  it("deve gerar PBKDF2 com salt aleatório", async () => {
    const firstHash = await hashPassword("12345678");
    const secondHash = await hashPassword("12345678");

    expect(firstHash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{64}$/);
    expect(secondHash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{64}$/);
    expect(firstHash).not.toBe(secondHash);
  });

  it("deve validar a senha correta", async () => {
    const hash = await hashPassword("medcof2026");

    await expect(verifyPassword("medcof2026", hash)).resolves.toBe(true);
  });

  it("deve rejeitar uma senha incorreta", async () => {
    const hash = await hashPassword("medcof2026");

    await expect(verifyPassword("senha-incorreta", hash)).resolves.toBe(false);
  });
});
