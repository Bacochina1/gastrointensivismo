"use client";

import { useState } from "react";

interface CheckoutButtonProps {
  stripeUrl?: string;
  buttonText?: string;
}

export function CheckoutButton({ stripeUrl, buttonText }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (stripeUrl) {
      window.location.href = stripeUrl;
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout indisponivel");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      console.error("Erro ao iniciar checkout:", checkoutError);
      setError("Nao foi possivel abrir o pagamento. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-4 bg-primary text-on-primary font-label-md font-semibold text-sm rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading
          ? "REDIRECIONANDO PARA PAGAMENTO..."
          : buttonText || "ASSINAR PLANO ELITE"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-center text-xs font-medium text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
