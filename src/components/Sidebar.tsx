"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface AulaItem {
  id: string;
  title: string;
  duration: string;
  module: string;
  type?: "vimeo" | "dropbox";
  videoUrl?: string;
}

export const aulasList: AulaItem[] = [
  // MÓDULO 1: CIRROSE, COAGULOPATIA & SANGRAMENTO
  {
    id: "cirrose-1",
    title: "Cirrose na UTI - 1",
    duration: "45 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/cy5ddms3j6kd3htzxukma/Cirrose-na-UTI-1.mp4?rlkey=0phg9s8d6hqg69va8flakoz7v&st=8epo4th2&dl=0"
  },
  {
    id: "cirrose-2",
    title: "Cirrose na UTI - 2",
    duration: "50 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/6gf58ximwwuoahrhxhie3/Cirrose-na-UTI-2-parte-1.mp4?rlkey=lblisynbw7bw20tt27m9zi958&st=85zge3c8&dl=0"
  },
  {
    id: "cirrose-3",
    title: "Cirrose na UTI - 3",
    duration: "48 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/td3sq4u9l46blmyrteh1w/Cirrose-na-UTI-3.mp4?rlkey=8vcqzm1qljlpbs8bky6cn0mbc&st=qgz70gyp&dl=0"
  },
  {
    id: "cirrose-4",
    title: "Cirrose na UTI - Parte 4",
    duration: "42 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/7qvkfr7afm8f3mit0zbqz/Cirrose-na-UTI-Parte-4.mp4?rlkey=di5vl2ahwnjfiat3w1ig8sn14&st=rm77g9y8&dl=0"
  },
  {
    id: "sangramento-alto",
    title: "Manejo do Sangramento Digestivo Alto",
    duration: "55 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/3cwkdpgozusqmqa9c4if8/Manejo-do-Sangramento-Digestivo-Alto.mp4?rlkey=opz5l8k218dbt0ot9whsa275z&st=dovt3zer&dl=0"
  },
  {
    id: "sangramento-baixo",
    title: "Manejo do Sangramento Digestivo Baixo",
    duration: "40 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/7nc5xxvrhs899f5cjhez0/Manejo-do-Sangramento-Digestivo-Baixo.mp4?rlkey=5pfyy2okubk8shgaqjemrcyas&st=njd6rjw5&dl=0"
  },
  {
    id: "coagulopatia-cirrose",
    title: "Coagulopatia x Cirrose",
    duration: "46 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/va5n5f06sk89egczc3o2x/Coagulopatia-x-Cirrose.mp4?rlkey=rh7ig38bzyjyicznw1biji3um&st=sxmlxmfv&dl=0"
  },
  {
    id: "conceitos-tromboelastometria",
    title: "Conceitos Básicos de Tromboelastometria",
    duration: "52 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/90q441wfwhb3ygqylvquo/Conceitos-B-sicos-de-Tromboelastometria.mp4?rlkey=mardqusk2ez8e4izubpnbatqw&st=0xoqmtu1&dl=0"
  },
  {
    id: "cuidados-paliativos",
    title: "Cuidados Paliativos no Paciente Cirrótico",
    duration: "38 min",
    module: "Módulo 1 • Cirrose & Hemorragia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/02dzjggjbu1qb05svo2vn/Cuidados-Paliativos-no-Paciente-Cirr-tico.mp4?rlkey=ffma491v0sedlwqevmvkqlkdr&st=hggx3zv2&dl=0"
  },

  // MÓDULO 2: EMERGÊNCIAS GASTROINTESTINAIS & DOENTE CRÍTICO
  {
    id: "sindrome-compartimental",
    title: "Síndrome Compartimental Abdominal",
    duration: "44 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/zh0yfyc4mqskmytivr0hz/S-ndrome-Compartimental-Abdominal.mp4?rlkey=jwt1cvw56shmf60p2up5n7sz3&st=bf8i3vz2&dl=0"
  },
  {
    id: "pancreatite-aguda",
    title: "Manejo intensivo da pancreatite aguda",
    duration: "58 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/wluk1898spczivc8yjpti/Manejo-intensivo-da-pancreatite-aguda.mp4?rlkey=lxfqolvzqx7fhzknw1ku93e0c&st=3w3i1xmp&dl=0"
  },
  {
    id: "diarreia-disfuncao",
    title: "Diarreia e disfunção gastrointestinal no doente crítico",
    duration: "41 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/vjnphxg6tlb1gd1u18vnb/Diarreia-e-disfun-o-gastrointestinal-no-doente-cr-tico.mp4?rlkey=620i0bc5aoz5eausq55p3f4ga&st=vtp85do3&dl=0"
  },
  {
    id: "insuficiencia-hepatica",
    title: "Insuficiência Hepática aguda",
    duration: "54 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/8pv1so2nm7no0qkupnyxn/Insufici-ncia-Hep-tica-aguda.mp4?rlkey=1lei5q534zul50bbuigl55nfu&st=53m3r9wo&dl=0"
  },
  {
    id: "aclf",
    title: "Acute On Chronic Liver Failure (ACLF)",
    duration: "49 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/w2g5z9p1ou1oeqjq1gxzf/Acute-On-Chronic-Liver-Failure-ACLF.mp4?rlkey=5t63wv31z9g1g2tuya89vt9al&st=ibcrzvrg&dl=0"
  },
  {
    id: "obeso-critico",
    title: "O Obeso Crítico",
    duration: "47 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/7mrd4y31tk3z7wkqzw0ve/O-Obeso-Cr-tico.mp4?rlkey=ktyuixp7snqsi21klx2scze1o&st=7ey36di7&dl=0"
  },
  {
    id: "abdome-agudo-1",
    title: "Abdome Agudo Vascular e Obstrutivo - Parte 01",
    duration: "45 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/pwkymiq3la3g02g4o55ub/Abdome-Agudo-Vascular-e-Obstrutivo-parte-2.mp4?rlkey=8mu5r2ruj2wrbixhrf0l4mqqe&st=ay5qy52x&dl=0"
  },
  {
    id: "abdome-agudo-2",
    title: "Abdome Agudo Vascular e Obstrutivo - Parte 02",
    duration: "52 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/pwkymiq3la3g02g4o55ub/Abdome-Agudo-Vascular-e-Obstrutivo-parte-2.mp4?rlkey=8mu5r2ruj2wrbixhrf0l4mqqe&st=ay5qy52x&dl=0"
  },
  {
    id: "infeccoes-hepatobiliares",
    title: "Infecções Hepatobiliares na UTI",
    duration: "43 min",
    module: "Módulo 2 • Emergências Gastrointestinais",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/9r2co7h6pgqi7cm7xhedm/Infec-es-Hepatobiliares-na-UTI.mp4?rlkey=hwh8e39yg1n39uiyhyg8egt71&st=ob0tpoyq&dl=0"
  },

  // MÓDULO 3: PERIOPERATÓRIO & CUIDADOS NUTRICIONAIS
  {
    id: "hipertensao-renal",
    title: "Hipertensão, Disfunção Renal e Oligúria no Perioperatório",
    duration: "46 min",
    module: "Módulo 3 • Perioperatório & Cirurgia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/ulfao6v3kpl8b7w7vzp8v/Hipertens-o-Disfun-o-Renal-e-Olig-ria-no-Perioperat-rio.mp4?rlkey=2da6b9ztmdqyhbm15ph3wah9e&st=mqlpndaq&dl=0"
  },
  {
    id: "complicacoes-abdominais-1",
    title: "Complicações Pós-Operatórias em cirurgias abdominais",
    duration: "51 min",
    module: "Módulo 3 • Perioperatório & Cirurgia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/ui743huoh1lg6mu30z774/Complica-es-P-s-Operatorias-em-cirurgias-abdominais.mp4?rlkey=2m0l8qweealj893f6e5fw1p2z&st=lxxydwzq&dl=0"
  },
  {
    id: "complicacoes-abdominais-2",
    title: "Complicações Pós-Operatórias em cirurgias abdominais específicas",
    duration: "48 min",
    module: "Módulo 3 • Perioperatório & Cirurgia",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/60qyxz1ciuaive0syame8/Complica-es-P-s-Operat-rias-em-cirurgias-abdominais-espec-ficas.mp4?rlkey=o6oqbp8hkh8ddr5vpf8lz0y28&st=y8jl1c2y&dl=0"
  },
  {
    id: "1166378128",
    title: "Conceitos Básicos em Nutrição na UTI e no Pós-operatório",
    duration: "48 min",
    module: "Módulo 3 • Perioperatório & Cirurgia",
    type: "vimeo"
  },
  {
    id: "1166378706",
    title: "Náuseas, Vômitos e Dor no Pós-operatório",
    duration: "42 min",
    module: "Módulo 3 • Perioperatório & Cirurgia",
    type: "vimeo"
  },

  // MÓDULO 4: TRANSPLANTES & SUPORTE AVANÇADO
  {
    id: "1168866145",
    title: "Complicações do Enxerto Hepático I",
    duration: "55 min",
    module: "Módulo 4 • Transplantes & Terapias Avançadas",
    type: "vimeo"
  },
  {
    id: "1168865180",
    title: "Complicações do Enxerto Hepático II",
    duration: "50 min",
    module: "Módulo 4 • Transplantes & Terapias Avançadas",
    type: "vimeo"
  },
  {
    id: "1171750181",
    title: "Suporte Hepático Extracorpóreo",
    duration: "62 min",
    module: "Módulo 4 • Transplantes & Terapias Avançadas",
    type: "vimeo"
  },
  {
    id: "1209960010",
    title: "Inicio da terapia nutricional no pós transplante hepático",
    duration: "45 min",
    module: "Módulo 4 • Transplantes & Terapias Avançadas",
    type: "vimeo"
  },
  {
    id: "pos-op-transplante-hepatico",
    title: "Manejo Pós-Operatório Imediato do Transplante Hepático na UTI",
    duration: "53 min",
    module: "Módulo 4 • Transplantes & Terapias Avançadas",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/qog2pamyhrnb8lqchiknz/Manejo-P-s-Operat-rio-Imediato-do-Transplante-Hep-tico-na-UTI.mp4?rlkey=u8q548iho4tng11833nfe80qi&st=511kx5al&dl=0"
  },
  {
    id: "transplante-pancreas-rim",
    title: "O pós operatório do transplante de Pâncreas-Rim",
    duration: "49 min",
    module: "Módulo 4 • Transplantes & Terapias Avançadas",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/vnev7if4mgr83bffxhoji/O-p-s-operatorio-do-transplante-de-pancreas-rim.mp4?rlkey=u57tgxfrfld1zumbvzuxqvnyo&st=yle0arp3&dl=0"
  },
  {
    id: "transplante-multivisceral",
    title: "O Transplante de intestino e multivisceral",
    duration: "57 min",
    module: "Módulo 4 • Transplantes & Terapias Avançadas",
    type: "dropbox",
    videoUrl: "https://www.dropbox.com/scl/fi/0njbqpbyeu132f344lj4x/O-Transplante-de-intestino-e-multivisceral.mp4?rlkey=o72b35dh1fp4ydosz90dbxmcg&st=56j9rgm0&dl=0"
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

  const modules = Array.from(new Set(aulasList.map(a => a.module)));

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
            Progresso do Treinamento
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

      {/* Lessons Navigation Organizada por Módulos */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <nav className="flex flex-col gap-4">
          {modules.map((moduleName) => {
            const moduleAulas = aulasList.filter(a => a.module === moduleName);
            const completedCount = moduleAulas.filter(a => completedLessons.includes(a.id)).length;

            return (
              <div key={moduleName} className="flex flex-col gap-1.5">
                <div className="px-2 py-1 bg-[#FAF7F6] rounded-xl border border-[#EAE2E0]/80 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary truncate pr-2">
                    {moduleName}
                  </span>
                  <span className="text-[10px] text-[#7F6E6C] font-bold shrink-0">
                    {completedCount}/{moduleAulas.length}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pl-1">
                  {moduleAulas.map((aula) => {
                    const globalIndex = aulasList.findIndex(a => a.id === aula.id) + 1;
                    const isActive = activeId === aula.id;
                    const isCompleted = completedLessons.includes(aula.id);

                    return (
                      <Link
                        key={aula.id}
                        href={`/aluno?v=${aula.id}`}
                        onClick={() => onCloseMobile?.()}
                        className={`p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          isActive
                            ? "bg-primary/10 text-primary font-bold border border-primary/25 shadow-sm"
                            : "text-[#4F4645] hover:bg-[#FAF7F6] font-medium border border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-[#059669] text-base font-bold">check_circle</span>
                          ) : isActive ? (
                            <span className="material-symbols-outlined text-primary text-base font-bold">play_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-[#B2A4A2] text-base font-light">radio_button_unchecked</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`line-clamp-2 leading-snug text-xs ${isActive ? "text-primary font-bold" : "text-[#1A1C1C]"}`}>
                            <span className="text-[#8A7876] font-bold mr-1">{globalIndex}.</span>
                            {aula.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[#8A7876] font-semibold">
                              ⏱️ {aula.duration}
                            </span>
                            {aula.type === "dropbox" && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                HD 1080p
                              </span>
                            )}
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

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#EAE2E0] bg-[#FAF7F6]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-[#1A1C1C] font-bold truncate">{user?.name || "Aluno Gastro"}</p>
                {user?.plan === "elite" ? (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    PREMIUM
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EAE2E0] text-[#5F4E4C] border border-[#D5CCC9] shrink-0">
                    BÁSICO
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#7F6E6C] truncate mt-0.5">{user?.email}</p>
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
