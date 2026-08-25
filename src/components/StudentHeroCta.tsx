"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

export function StudentHeroCta() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("gastro_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.email || parsed.id)) {
          setIsLoggedIn(true);
        }
      }
    } catch {}
  }, []);

  if (mounted && isLoggedIn) {
    return (
      <div className="flex flex-wrap items-center gap-stack-md mt-stack-sm">
        <Link
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md px-10 py-4 rounded-full shadow-lg shadow-primary/25 hover:bg-primary-container transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-base font-bold uppercase tracking-wider"
          href="/aluno"
        >
          <PlayCircle className="w-5 h-5" />
          ACESSAR MEU CURSO
          <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          className="inline-flex items-center justify-center border border-surface-variant text-on-surface font-label-md px-8 py-4 rounded-full hover:border-outline hover:text-primary transition-all bg-surface-container-lowest shadow-sm hover:shadow-md active:scale-95 text-sm font-semibold"
          href="#professores"
        >
          CORPO DOCENTE
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-stack-md mt-stack-sm">
      <a
        className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md px-10 py-4 rounded-full shadow-lg shadow-primary/25 hover:bg-primary-container transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-base font-semibold"
        href="#planos"
      >
        SAIBA MAIS
      </a>
      <a
        className="inline-flex items-center justify-center border border-surface-variant text-on-surface font-label-md px-8 py-4 rounded-full hover:border-outline hover:text-primary transition-all bg-surface-container-lowest shadow-sm hover:shadow-md active:scale-95"
        href="#professores"
      >
        CORPO DOCENTE
      </a>
    </div>
  );
}
