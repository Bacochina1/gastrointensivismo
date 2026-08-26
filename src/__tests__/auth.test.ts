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

describe("Tokens de Recuperação de Senha (HMAC-SHA256)", () => {
  it("deve gerar e validar um token legítimo", async () => {
    const { createPasswordResetToken, verifyPasswordResetToken } = await import("@/lib/session");
    const email = "aluno@gastro.com";
    const token = await createPasswordResetToken(email);

    expect(token).toContain(".");
    const isValid = await verifyPasswordResetToken(token, email);
    expect(isValid).toBe(true);
  });

  it("deve rejeitar token com e-mail divergente", async () => {
    const { createPasswordResetToken, verifyPasswordResetToken } = await import("@/lib/session");
    const token = await createPasswordResetToken("aluno@gastro.com");

    const isValid = await verifyPasswordResetToken(token, "outro@gastro.com");
    expect(isValid).toBe(false);
  });

  it("deve rejeitar token adulterado", async () => {
    const { createPasswordResetToken, verifyPasswordResetToken } = await import("@/lib/session");
    const token = await createPasswordResetToken("aluno@gastro.com");
    const [payload, signature] = token.split(".");
    const tamperedToken = `${payload}.${signature.slice(0, -4)}0000`;

    const isValid = await verifyPasswordResetToken(tamperedToken, "aluno@gastro.com");
    expect(isValid).toBe(false);
  });
});
