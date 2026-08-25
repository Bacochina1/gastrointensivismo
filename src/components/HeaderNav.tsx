"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserCheck, Sparkles, LogIn } from "lucide-react";

export function HeaderNav() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("gastro_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.email || parsed.id)) {
          setUser(parsed);
        }
      }
    } catch {}
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "Aluno";

  return (
    <header className="fixed top-0 w-full z-50 px-margin-mobile lg:px-margin-desktop bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-variant/60 transition-all shadow-sm">
      <div className="h-20 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            alt="Gastrointensivismo Logo"
            className="h-8 w-auto object-contain"
            src="/logo.png"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-stack-lg">
          <a
            className="font-label-sm text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors tracking-widest uppercase"
            href="#sobre"
          >
            O TREINAMENTO
          </a>
          <a
            className="font-label-sm text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors tracking-widest uppercase"
            href="#professores"
          >
            PROFESSORES
          </a>
          <a
            className="font-label-sm text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors tracking-widest uppercase"
            href="#planos"
          >
            PLANOS
          </a>
          <a
            className="font-label-sm text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors tracking-widest uppercase"
            href="#faq"
          >
            FAQ
          </a>

          {mounted && user ? (
            <Link
              href="/aluno"
              className="inline-flex items-center gap-2.5 bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-xs font-bold hover:bg-primary-container transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>ÁREA DO ALUNO ({firstName})</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold text-on-surface-variant hover:text-primary uppercase tracking-wider px-3 py-2 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Área do Aluno
              </Link>
              <a
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-sm font-semibold hover:bg-primary-container transition-all shadow-md shadow-primary/15 hover:-translate-y-0.5 active:scale-95"
                href="#planos"
              >
                MATRICULE-SE
              </a>
            </div>
          )}
        </nav>

        {/* Mobile Header CTA */}
        <div className="lg:hidden flex items-center">
          {mounted && user ? (
            <Link
              href="/aluno"
              className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm text-xs font-bold shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ÁREA DO ALUNO
            </Link>
          ) : (
            <a
              className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm text-xs font-semibold shadow-sm"
              href="#planos"
            >
              MATRICULE-SE
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
