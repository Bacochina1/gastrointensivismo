"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
        <span className="material-symbols-outlined text-3xl">refresh</span>
      </div>
      <h1 className="text-2xl font-bold text-on-background mb-2">
        Gastrointensivismo
      </h1>
      <p className="text-secondary max-w-md mb-6 text-sm leading-relaxed">
        Ocorreu uma instabilidade temporária ao carregar a página. Clique para tentar novamente.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow hover:bg-primary-container transition-all cursor-pointer active:scale-95"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
