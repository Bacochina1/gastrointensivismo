import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar, aulasList } from "@/components/Sidebar";

// Mock do next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (param: string) => (param === "v" ? "1166378128" : null),
  }),
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Componente Sidebar", () => {
  it("deve renderizar a logo e a lista de aulas 2026", () => {
    render(<Sidebar user={{ name: "Dr. Aluno Teste", email: "teste@gastro.com" }} />);
    
    expect(screen.getByAltText("Gastrointensivismo")).toBeInTheDocument();
    expect(screen.getByText("Turma 2026")).toBeInTheDocument();
  });

  it("deve listar todas as 30 aulas configuradas no curso", () => {
    render(<Sidebar />);
    
    expect(aulasList).toHaveLength(30);
    aulasList.forEach((aula) => {
      expect(screen.getByText(aula.title)).toBeInTheDocument();
    });
  });

  it("deve exibir o nome e e-mail do aluno logado", () => {
    render(<Sidebar user={{ name: "Dra. Paula Silva", email: "paula@medcof.com.br" }} />);
    
    expect(screen.getByText("Dra. Paula Silva")).toBeInTheDocument();
    expect(screen.getByText("paula@medcof.com.br")).toBeInTheDocument();
  });
});
