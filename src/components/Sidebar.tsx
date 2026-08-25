"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface AulaItem {
  id: string;
  title: string;
  duration: string;
  module: string;
}

export const aulasList: AulaItem[] = [
  { id: "1166378128", title: "Conceitos Básicos em Nutrição na UTI e no Pós-operatório", duration: "48 min", module: "Módulo 1 • Nutrição & Suporte" },
  { id: "1166378706", title: "Náuseas, Vômitos e Manejo de Dor Refratária no Pós-operatório", duration: "42 min", module: "Módulo 1 • Nutrição & Suporte" },
  { id: "1168866145", title: "Complicações Precoces do Enxerto Hepático na UTI (Parte I)", duration: "55 min", module: "Módulo 2 • Transplante Hepático" },
  { id: "1168865180", title: "Complicações Vasculares e Biliares do Enxerto Hepático (Parte II)", duration: "50 min", module: "Módulo 2 • Transplante Hepático" },
  { id: "1171750181", title: "Suporte Hepático Extracorpóreo: Indicações e Manejo Crítico", duration: "62 min", module: "Módulo 3 • Terapias Avançadas" },
  { id: "1209960010", title: "Terapia Nutricional Especializada no Pós-transplante Imediato", duration: "45 min", module: "Módulo 3 • Terapias Avançadas" },
];

interface UserProps {
  name?: string;
  email?: string;
}

export function Sidebar({ user, onCloseMobile }: { user?: UserProps; onCloseMobile?: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = searchParams?.get("v") || aulasList[0].id;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gastro_completed_lessons");
      if (saved) setCompletedLessons(JSON.parse(saved));
    } catch {}
  }, []);

  const progressPercent = Math.round((completedLessons.length / aulasList.length) * 100);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      localStorage.removeItem("gastro_user");
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-[#EAE2E0] flex-shrink-0 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Header Logo */}
      <div className="p-6 border-b border-[#EAE2E0] flex items-center justify-between">
        <Link href="/aluno" className="flex items-center gap-2">
          <img
            alt="Gastrointensivismo"
            className="h-8 w-auto object-contain"
            src="/logo.png"
          />
        </Link>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Turma 2026
        </span>
      </div>

      {/* Progress Widget */}
      <div className="p-5 border-b border-[#EAE2E0] bg-[#FAF7F6]">
        <div className="flex items-center justify-between text-xs font-bold text-[#1A1C1C] mb-2">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            Progresso Geral
          </span>
          <span className="text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#EAE2E0] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-[#7F6E6C] mt-2 font-medium">
          {completedLessons.length} de {aulasList.length} aulas concluídas
        </p>
      </div>

      {/* Lessons Navigation */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h4 className="text-[11px] text-[#7F6E6C] uppercase tracking-widest font-extrabold mb-3 px-2">
          Grade Curricular
        </h4>
        <nav className="flex flex-col gap-1.5">
          {aulasList.map((aula, index) => {
            const isActive = activeId === aula.id;
            const isCompleted = completedLessons.includes(aula.id);

            return (
              <Link
                key={aula.id}
                href={`/aluno?v=${aula.id}`}
                onClick={() => onCloseMobile?.()}
                className={`p-3 rounded-2xl text-xs transition-all flex items-start gap-3 ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold border border-primary/25 shadow-sm"
                    : "text-[#4F4645] hover:bg-[#FAF7F6] font-medium border border-transparent"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[#059669] text-lg font-bold">check_circle</span>
                  ) : isActive ? (
                    <span className="material-symbols-outlined text-primary text-lg font-bold">play_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-[#B2A4A2] text-lg font-light">radio_button_unchecked</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`line-clamp-2 leading-snug ${isActive ? "text-primary" : "text-[#1A1C1C]"}`}>
                    <span className="text-[#8A7876] font-bold mr-1">{index + 1}.</span>
                    {aula.title}
                  </p>
                  <span className="text-[10px] text-[#8A7876] mt-1 inline-block font-semibold">
                    ⏱️ {aula.duration}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#EAE2E0] bg-[#FAF7F6]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="truncate">
              <p className="text-xs text-[#1A1C1C] font-bold truncate">{user?.name || "Aluno Gastro"}</p>
              <p className="text-[10px] text-[#7F6E6C] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da Conta"
            className="text-[#7F6E6C] hover:text-primary p-2 rounded-lg hover:bg-white transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
