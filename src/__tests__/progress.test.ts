import { describe, it, expect } from "vitest";
import { GET, POST } from "../app/api/progress/route";

describe("API de Progresso do Aluno (/api/progress)", () => {
  it("deve retornar erro 400 se userId não for informado no GET", async () => {
    const req = new Request("http://localhost/api/progress");
    const res = await GET(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("userId é obrigatório");
  });

  it("deve incluir cabeçalhos estritos de no-cache na resposta GET", async () => {
    const req = new Request("http://localhost/api/progress?userId=user123");
    const res = await GET(req);
    
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("deve retornar erro 400 no POST se faltar parâmetros", async () => {
    const req = new Request("http://localhost/api/progress", {
      method: "POST",
      body: JSON.stringify({ userId: "user123" }),
    });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("userId e lessonId são obrigatórios");
  });

  it("deve falhar de forma segura quando o D1 não está disponível", async () => {
    const req = new Request("http://localhost/api/progress", {
      method: "POST",
      body: JSON.stringify({ userId: "user123", lessonId: "aula01", completed: true }),
    });
    const res = await POST(req);
    
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe("Banco de dados indisponível");
  });
});
