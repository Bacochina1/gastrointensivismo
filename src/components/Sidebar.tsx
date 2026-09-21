"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export interface AulaItem {
  id: string;
  vimeoId: string;
  title: string;
  duration: string;
  module: string;
  professor: string;
  year: 2025 | 2026;
  type?: "vimeo";
  videoUrl?: string;
  slidesUrl?: string;
}

export const aulasList: AulaItem[] = [
  // ==========================================
  // MÓDULO 1: CIRROSE & HEMORRAGIA (9 Aulas)
  // ==========================================
  {
    id: "cirrose-1",
    vimeoId: "1228889268",
    title: "Cirrose na UTI - 1",
    duration: "30 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228889268",
    slidesUrl: "/slides/cirrose-1.pdf"
  },
  {
    id: "cirrose-2",
    vimeoId: "1228885517",
    title: "Cirrose na UTI - 2",
    duration: "39 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228885517",
    slidesUrl: "/slides/cirrose-2.pdf"
  },
  {
    id: "cirrose-3",
    vimeoId: "1228887227",
    title: "Cirrose na UTI - 3",
    duration: "32 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228887227",
    slidesUrl: "/slides/cirrose-3.pdf"
  },
  {
    id: "cirrose-4",
    vimeoId: "1228881402",
    title: "Cirrose na UTI - Parte 4",
    duration: "39 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228881402",
    slidesUrl: "/slides/cirrose-4.pdf"
  },
  {
    id: "sangramento-alto",
    vimeoId: "1228909943",
    title: "Manejo do Sangramento Digestivo Alto",
    duration: "38 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Lucas Araujo",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228909943",
    slidesUrl: "/slides/sangramento-alto.pdf"
  },
  {
    id: "sangramento-baixo",
    vimeoId: "1228909942",
    title: "Manejo do Sangramento Digestivo Baixo",
    duration: "27 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Lucas Araujo",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228909942",
    slidesUrl: "/slides/sangramento-baixo.pdf"
  },
  {
    id: "coagulopatia-cirrose",
    vimeoId: "1228881405",
    title: "Coagulopatia x Cirrose",
    duration: "28 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228881405",
    slidesUrl: "/slides/coagulopatia-cirrose.pdf"
  },
  {
    id: "conceitos-tromboelastometria",
    vimeoId: "1228881403",
    title: "Conceitos Básicos de Tromboelastometria",
    duration: "40 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228881403",
    slidesUrl: "/slides/conceitos-tromboelastometria.pdf"
  },
  {
    id: "cuidados-paliativos",
    vimeoId: "1228905313",
    title: "Cuidados Paliativos no Paciente Cirrótico",
    duration: "58 min",
    module: "Módulo 1 — Cirrose & Hemorragia",
    professor: "Dra. Bruna Scharanch",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228905313",
    slidesUrl: "/slides/cuidados-paliativos.pdf"
  },

  // ===================================================
  // MÓDULO 2: EMERGÊNCIAS GASTROINTESTINAIS (9 Aulas)
  // ===================================================
  {
    id: "sindrome-compartimental",
    vimeoId: "1228905304",
    title: "Síndrome Compartimental Abdominal",
    duration: "35 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dra. Bruna Scharanch",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228905304",
    slidesUrl: "/slides/sindrome-compartimental.pdf"
  },
  {
    id: "pancreatite-aguda",
    vimeoId: "1228899374",
    title: "Manejo intensivo da pancreatite aguda",
    duration: "34 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dra. Paula Mesquita",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228899374",
    slidesUrl: "/slides/pancreatite-aguda.pdf"
  },
  {
    id: "diarreia-disfuncao",
    vimeoId: "1228900054",
    title: "Diarreia e disfunção gastrointestinal no doente crítico",
    duration: "25 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dra. Paula Mesquita",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228900054",
    slidesUrl: "/slides/diarreia-disfuncao.pdf"
  },
  {
    id: "insuficiencia-hepatica",
    vimeoId: "1228898538",
    title: "Insuficiência Hepática aguda",
    duration: "38 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dra. Paula Mesquita",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228898538",
    slidesUrl: "/slides/insuficiencia-hepatica.pdf"
  },
  {
    id: "aclf",
    vimeoId: "1228909944",
    title: "Acute On Chronic Liver Failure (ACLF)",
    duration: "38 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dr. Lucas Araujo",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228909944",
    slidesUrl: "/slides/aclf.pdf"
  },
  {
    id: "obeso-critico",
    vimeoId: "1228911945",
    title: "O Obeso Crítico",
    duration: "49 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dr. Lucas Araujo",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228911945",
    slidesUrl: "/slides/obeso-critico.pdf"
  },
  {
    id: "abdome-agudo-1",
    vimeoId: "1228893928",
    title: "Abdome Agudo Vascular e Obstrutivo - Parte 01",
    duration: "14 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dra. Paula Mesquita",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228893928",
    slidesUrl: "/slides/abdome-agudo-vascular-e-obstrutivo.pdf"
  },
  {
    id: "abdome-agudo-2",
    vimeoId: "1228893930",
    title: "Abdome Agudo Vascular e Obstrutivo - parte 2",
    duration: "14 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dra. Paula Mesquita",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228893930",
    slidesUrl: "/slides/abdome-agudo-vascular-e-obstrutivo.pdf"
  },
  {
    id: "infeccoes-hepatobiliares",
    vimeoId: "1228893927",
    title: "Infecções Hepatobiliares na UTI",
    duration: "24 min",
    module: "Módulo 2 — Emergências Gastrointestinais",
    professor: "Dra. Paula Mesquita",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228893927",
    slidesUrl: "/slides/infeccoes-hepatobiliares.pdf"
  },

  // ==================================================
  // MÓDULO 3: PERIOPERATÓRIO & CIRURGIA (5 Aulas)
  // ==================================================
  {
    id: "hipertensao-renal",
    vimeoId: "1228903434",
    title: "Hipertensão, Disfunção Renal e Oligúria no Perioperatório",
    duration: "35 min",
    module: "Módulo 3 — Perioperatório & Cirurgia",
    professor: "Dra. Paula Mesquita",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228903434",
    slidesUrl: "/slides/hipertensao-renal.pdf"
  },
  {
    id: "complicacoes-abdominais-1",
    vimeoId: "1228881404",
    title: "Complicações Pós-Operatorias em cirurgias abdominais",
    duration: "43 min",
    module: "Módulo 3 — Perioperatório & Cirurgia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228881404",
    slidesUrl: "/slides/complicacoes-abdominais-1.pdf"
  },
  {
    id: "complicacoes-abdominais-2",
    vimeoId: "1228884864",
    title: "Complicações Pós-Operatórias em cirurgias abdominais específicas",
    duration: "33 min",
    module: "Módulo 3 — Perioperatório & Cirurgia",
    professor: "Dr. Rodolpho Pedro",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228884864",
    slidesUrl: "/slides/complicacoes-abdominais-2.pdf"
  },
  {
    id: "1166378128",
    vimeoId: "1166378128",
    title: "Conceitos Básicos em Nutrição na UTI e no Pós-operatório",
    duration: "30 min",
    module: "Módulo 3 — Perioperatório & Cirurgia",
    professor: "Dra. Bruna Scharanch",
    year: 2026,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1166378128",
    slidesUrl: "/slides/nutricao-uti.pdf"
  },
  {
    id: "1166378706",
    vimeoId: "1166378706",
    title: "Náuseas, Vômitos e Dor no Pós-operatório_1",
    duration: "38 min",
    module: "Módulo 3 — Perioperatório & Cirurgia",
    professor: "Dra. Bruna Scharanch",
    year: 2026,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1166378706",
    slidesUrl: "/slides/nauseas-vomitos.pdf"
  },

  // =============================================================
  // MÓDULO 4: TRANSPLANTES & TERAPIAS AVANÇADAS (7 Aulas)
  // =============================================================
  {
    id: "1168866145",
    vimeoId: "1168866145",
    title: "Complicações do Enxerto Hepático I",
    duration: "35 min",
    module: "Módulo 4 — Transplantes & Terapias Avançadas",
    professor: "Dr. Lucas Araujo",
    year: 2026,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1168866145",
    slidesUrl: "/slides/enxerto-hepatico-1.pdf"
  },
  {
    id: "1168865180",
    vimeoId: "1168865180",
    title: "Complicações do Enxerto Hepático II",
    duration: "34 min",
    module: "Módulo 4 — Transplantes & Terapias Avançadas",
    professor: "Dr. Lucas Araujo",
    year: 2026,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1168865180",
    slidesUrl: "/slides/enxerto-hepatico-2.pdf"
  },
  {
    id: "1171750181",
    vimeoId: "1171750181",
    title: "Suporte Hepático Extracorpóreo - EDITADO",
    duration: "43 min",
    module: "Módulo 4 — Transplantes & Terapias Avançadas",
    professor: "Dr. Rodolpho Pedro",
    year: 2026,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1171750181"
  },
  {
    id: "1209960010",
    vimeoId: "1209960010",
    title: "Inicio da terapia nutricional no pós transplante hepático_1",
    duration: "36 min",
    module: "Módulo 4 — Transplantes & Terapias Avançadas",
    professor: "Dra. Bruna Scharanch",
    year: 2026,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1209960010",
    slidesUrl: "/slides/nutricao-transplante.pdf"
  },
  {
    id: "pos-op-transplante-hepatico",
    vimeoId: "1228909945",
    title: "Manejo Pós-Operatório Imediato do Transplante Hepático na UTI",
    duration: "40 min",
    module: "Módulo 4 — Transplantes & Terapias Avançadas",
    professor: "Dr. Lucas Araujo",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228909945",
    slidesUrl: "/slides/pos-op-transplante-hepatico.pdf"
  },
  {
    id: "transplante-pancreas-rim",
    vimeoId: "1228905311",
    title: "O pós operatorio do transplante de pancreas-rim",
    duration: "49 min",
    module: "Módulo 4 — Transplantes & Terapias Avançadas",
    professor: "Dra. Bruna Scharanch",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228905311",
    slidesUrl: "/slides/transplante-pancreas-rim.pdf"
  },
  {
    id: "transplante-multivisceral",
    vimeoId: "1228905312",
    title: "O Transplante de intestino e multivisceral",
    duration: "32 min",
    module: "Módulo 4 — Transplantes & Terapias Avançadas",
    professor: "Dra. Bruna Scharanch",
    year: 2025,
    type: "vimeo",
    videoUrl: "https://vimeo.com/1228905312",
    slidesUrl: "/slides/transplante-multivisceral.pdf"
  }
];

interface UserProps {
  name?: string;
  email?: string;
  plan?: string;
}

export function Sidebar({ user, onCloseMobile }: { user?: UserProps; onCloseMobile?: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeId = searchParams?.get("v") || aulasList[0].id;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const loadCompleted = useCallback(() => {
    try {
      const saved = localStorage.getItem("gastro_completed_lessons");
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadCompleted();

    // Sincronização em tempo real quando aula é concluída pelo player ou em outra aba
    const handleProgressUpdate = () => {
      loadCompleted();
    };

    window.addEventListener("gastro_progress_updated", handleProgressUpdate);
    window.addEventListener("storage", handleProgressUpdate);

    return () => {
      window.removeEventListener("gastro_progress_updated", handleProgressUpdate);
      window.removeEventListener("storage", handleProgressUpdate);
    };
  }, [loadCompleted]);

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

  const modules = Array.from(new Set(aulasList.map(a => a.module)));

  return (
    <aside className="w-80 bg-surface-container-lowest border-r border-outline-variant/30 flex-shrink-0 flex flex-col h-full max-h-screen sticky top-0 z-40 select-none font-body-md text-on-background">
      {/* Header Logo */}
      <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
        <Link href="/aluno" className="flex items-center gap-2">
          <img
            alt="Gastrointensivismo"
            className="h-8 w-auto object-contain"
            src="/logo.png"
          />
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-label-sm uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold text-[11px]">
            Turma 2026
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-secondary hover:text-on-background hover:bg-surface-container-low transition-colors cursor-pointer lg:hidden"
              aria-label="Fechar menu lateral"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Widget */}
      <div className="p-5 border-b border-outline-variant/30 bg-surface-container-low">
        <div className="flex items-center justify-between font-label-sm font-bold text-on-background mb-2">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">trending_up</span>
            Progresso do Curso
          </span>
          <span className="text-primary font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="font-label-sm text-secondary mt-2">
          {completedLessons.length} de {aulasList.length} aulas concluídas
        </p>
      </div>

      {/* Lessons Navigation Organizada por Módulos */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <nav className="flex flex-col gap-4">
          {modules.map((moduleName) => {
            const moduleAulas = aulasList.filter(a => a.module === moduleName);
            const completedCount = moduleAulas.filter(a => completedLessons.includes(a.id)).length;

            return (
              <div key={moduleName} className="flex flex-col gap-1.5">
                <div className="px-2.5 py-1.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-primary font-bold text-[11px] leading-snug break-words flex-1 pr-1">
                    {moduleName}
                  </span>
                  <span className="font-label-sm text-secondary font-semibold shrink-0">
                    {completedCount}/{moduleAulas.length}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pl-1">
                  {moduleAulas.map((aula) => {
                    const globalIndex = aulasList.findIndex(a => a.id === aula.id) + 1;
                    const isActive = activeId === aula.id || (Boolean(aula.vimeoId) && activeId === aula.vimeoId);
                    const isCompleted = completedLessons.includes(aula.id);

                    return (
                      <Link
                        key={aula.id}
                        href={`/aluno?v=${aula.id}`}
                        onClick={() => onCloseMobile?.()}
                        className={`p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                          isActive
                            ? "bg-primary/10 text-primary font-bold border border-primary/25 shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container-low font-medium border border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-tertiary text-base font-bold">check_circle</span>
                          ) : isActive ? (
                            <span className="material-symbols-outlined text-primary text-base font-bold">play_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-outline-variant text-base font-light">radio_button_unchecked</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug truncate ${isActive ? "text-primary font-bold" : "text-on-background"}`}>
                            <span className="text-secondary font-bold mr-1.5">{globalIndex}.</span>
                            {aula.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-secondary flex-wrap">
                            <span className="font-medium text-on-surface-variant/80">{aula.professor}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              aula.year === 2026 ? "bg-primary/10 text-primary" : "bg-surface-container-high text-secondary"
                            }`}>
                              {aula.year}
                            </span>
                            <span>•</span>
                            <span>{aula.duration}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-background truncate">
                {user?.name || "Aluno Gastrointensivismo"}
              </p>
              <p className="text-[11px] text-secondary truncate">
                {user?.email || "aluno@medcof.com.br"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da Plataforma"
            className="p-1.5 text-secondary hover:text-error hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
