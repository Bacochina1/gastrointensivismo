"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Cookie } from "lucide-react";
import { PrivacyModal } from "./PrivacyModal";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("gastro_cookie_consent");
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // Ignora erro de localStorage desabilitado
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("gastro_cookie_consent", "all");
    } catch {}
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem("gastro_cookie_consent", "essential");
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner) {
    return (
      <>
        <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-white/95 backdrop-blur-md p-5 rounded-[24px] border border-[#E5DCDB] shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1C1C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Privacidade &amp; Cookies (LGPD)</span>
            </h4>
            <p className="text-xs text-[#5F4E4C] leading-relaxed">
              Utilizamos cookies essenciais para autenticação e segurança do portal, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EAE2E0]">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 bg-primary text-white text-[11px] font-bold rounded-full hover:bg-primary-container transition-all text-center shadow-sm"
          >
            Aceitar Todos
          </button>
          <button
            onClick={handleAcceptEssential}
            className="py-2 px-3 bg-[#FAF7F6] text-[#4F4645] border border-[#E5DCDB] text-[11px] font-bold rounded-full hover:bg-[#EAE2E0] transition-all"
          >
            Apenas Essenciais
          </button>
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="text-[11px] text-primary hover:underline font-bold px-1"
          >
            Ler Política
          </button>
        </div>
      </div>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
}
