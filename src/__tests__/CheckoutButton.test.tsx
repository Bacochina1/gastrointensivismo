import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CheckoutButton } from "@/components/CheckoutButton";

describe("Componente CheckoutButton", () => {
  it("deve renderizar o botão de assinatura com o texto correto", () => {
    render(<CheckoutButton />);
    const button = screen.getByRole("button", { name: /ASSINAR PLANO ELITE/i });
    expect(button).toBeInTheDocument();
  });

  it("deve chamar a API /api/checkout e redirecionar para a URL do Stripe", async () => {
    const mockCheckoutUrl = "https://checkout.stripe.com/c/pay/cs_live_123456";
    
    // Mock do fetch global
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: mockCheckoutUrl }),
    } as Response);

    // Mock window.location
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { href: "" },
    });

    render(<CheckoutButton />);
    const button = screen.getByRole("button", { name: /ASSINAR PLANO ELITE/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/checkout", expect.any(Object));
      expect(window.location.href).toBe(mockCheckoutUrl);
    });
  });

  it("deve redirecionar para a URL do Stripe diretamente quando fornecida via prop", () => {
    const stripeUrl = "https://checkout.stripe.com/test-session";
    
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { href: "" },
    });

    render(<CheckoutButton stripeUrl={stripeUrl} />);
    const button = screen.getByRole("button", { name: /ASSINAR PLANO ELITE/i });
    fireEvent.click(button);

    expect(window.location.href).toBe(stripeUrl);
  });
});
