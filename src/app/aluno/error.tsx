"use client";

import { useEffect } from "react";

export default function AlunoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Aluno error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
        <span className="material-symbols-outlined text-3xl">play_circle</span>
      </div>
      <h2 className="text-xl font-bold text-on-background mb-2">
        Carregando reprodução da aula...
      </h2>
      <p className="text-secondary max-w-md mb-6 text-sm leading-relaxed">
        Houve uma pequena oscilação ao inicializar o player de vídeo. Clique no botão abaixo para restaurar a aula instantaneamente.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow hover:bg-primary-container transition-all cursor-pointer active:scale-95"
      >
        Recarregar Aula
      </button>
    </div>
  );
}
