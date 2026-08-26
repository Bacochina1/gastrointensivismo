"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { aulasList } from "@/components/Sidebar";

function AlunoContent() {
  const [activeTab, setActiveTab] = useState<"materiais" | "anotacoes" | "discussao">("materiais");
  const [activePdfModal, setActivePdfModal] = useState<{ title: string; url: string } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [playbackTime, setPlaybackTime] = useState(0);
  const [user, setUser] = useState<{ id?: string; name?: string; email?: string } | null>(null);

  const materiaisList = [
    {
      id: "banco-questoes",
      title: "Banco de Questões Final",
      description: "Banco completo com questões comentadas de Terapia Intensiva e complicações gastrointestinais para fixação prática e provas de título.",
      category: "Banco de Questões • PDF",
      url: "https://assets.grupomedcof.com.br/fc5c220a-997c-4333-a4b6-2125c40fd444.pdf",
      badge: "Completo",
      tag: "Revisado 2026",
    },
    {
      id: "tromboelastometria",
      title: "30 Tromboelastometrias Comentadas (Layout Revisado)",
      description: "Guia clínico com interpretação de 30 traçados de tromboelastometria (TEG/ROTEM) no choque, pós-operatório de grandes cirurgias e transplante.",
      category: "Casos Clínicos • PDF",
      url: "https://assets.grupomedcof.com.br/7d8777d4-1e78-4d1f-98b6-0ae7f0f7a41b.pdf",
      badge: "30 Casos",
      tag: "Layout Revisado",
    },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams?.get("v") || aulasList[0].id;
  
  const activeIndex = aulasList.findIndex(a => a.id === activeId);
  const activeAula = aulasList[activeIndex >= 0 ? activeIndex : 0];
  const currentIndex = (activeIndex >= 0 ? activeIndex : 0) + 1;

  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Carregar usuário e progresso inicial
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gastro_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }

      // Carregar aulas concluídas locais
      const localCompleted = localStorage.getItem("gastro_completed_lessons");
      if (localCompleted) setCompletedLessons(JSON.parse(localCompleted));

      // Carregar anotações locais da aula
      const localNotes = localStorage.getItem(`gastro_notes_${activeAula.id}`);
      if (localNotes) setNotes(localNotes);
      else setNotes("");

      // Carregar tempo salvo onde parou
      const localPlayback = localStorage.getItem(`gastro_time_${activeAula.id}`);
      if (localPlayback) setPlaybackTime(Number(localPlayback));
      else setPlaybackTime(0);
    } catch {}
  }, [activeAula.id]);

  // 2. Sincronizar com Backend via /api/progress
  useEffect(() => {
    if (!user?.id && !user?.email) return;
    const userId = user.id || user.email || "aluno_dev";

    fetch(`/api/progress?userId=${encodeURIComponent(userId)}&lessonId=${encodeURIComponent(activeAula.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.completedLessons) {
            setCompletedLessons(data.completedLessons);
            localStorage.setItem("gastro_completed_lessons", JSON.stringify(data.completedLessons));
          }
          if (data.currentLesson?.notes !== undefined && data.currentLesson.notes !== "") {
            setNotes(data.currentLesson.notes);
            localStorage.setItem(`gastro_notes_${activeAula.id}`, data.currentLesson.notes);
          }
          if (data.currentLesson?.playbackTime) {
            setPlaybackTime(data.currentLesson.playbackTime);
            localStorage.setItem(`gastro_time_${activeAula.id}`, String(data.currentLesson.playbackTime));
          }
        }
      })
      .catch((err) => console.error("Erro ao sincronizar progresso:", err));
  }, [user, activeAula.id]);

  // 3. Salvar última aula acessada no histórico do usuário
  useEffect(() => {
    if (!user?.id && !user?.email) return;
    const userId = user.id || user.email || "aluno_dev";

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        lessonId: activeAula.id,
      }),
    }).catch(() => {});
  }, [user, activeAula.id]);

  const isCompleted = completedLessons.includes(activeAula.id);

  // 4. Alternar status de aula concluída
  const toggleComplete = async () => {
    let updated: string[];
    const willBeCompleted = !isCompleted;
    
    if (isCompleted) {
      updated = completedLessons.filter(id => id !== activeAula.id);
    } else {
      updated = [...completedLessons, activeAula.id];
    }
    
    setCompletedLessons(updated);
    localStorage.setItem("gastro_completed_lessons", JSON.stringify(updated));

    // Salvar no servidor
    const userId = user?.id || user?.email || "aluno_dev";
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          lessonId: activeAula.id,
          completed: willBeCompleted,
          notes,
          playbackTime,
        }),
      });
    } catch {}
  };

  // 5. Salvar anotações do aluno (auto-save com debounce)
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus("saving");
    localStorage.setItem(`gastro_notes_${activeAula.id}`, val);

    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    notesTimeoutRef.current = setTimeout(async () => {
      const userId = user?.id || user?.email || "aluno_dev";
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            lessonId: activeAula.id,
            notes: val,
            completed: isCompleted,
            playbackTime,
          }),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("idle");
      }
    }, 1200);
  };

  const goToPrev = () => {
    if (activeIndex > 0) {
      router.push(`/aluno?v=${aulasList[activeIndex - 1].id}`);
    }
  };

  const goToNext = () => {
    if (activeIndex < aulasList.length - 1) {
      router.push(`/aluno?v=${aulasList[activeIndex + 1].id}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1240px] mx-auto w-full">
      {/* Header com Breadcrumb, Título e Ação */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-[#EAE2E0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
            <span>{activeAula.module}</span>
            <span className="text-[#B2A4A2]">•</span>
            <span className="text-[#7F6E6C]">⏱️ {activeAula.duration}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1C] tracking-tight leading-tight">
            {currentIndex}. {activeAula.title}
          </h1>
        </div>

        {/* Botão de Marcar como Concluída */}
        <button
          onClick={toggleComplete}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0 ${
            isCompleted
              ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] hover:bg-[#D1FAE5]"
              : "bg-white text-[#1A1C1C] border border-[#E5DCDB] hover:border-primary hover:text-primary"
          }`}
        >
          <span className={`material-symbols-outlined text-base ${isCompleted ? "text-[#059669]" : "text-[#7F6E6C]"}`}>
            {isCompleted ? "check_circle" : "radio_button_unchecked"}
          </span>
          <span>{isCompleted ? "Aula Concluída" : "Marcar como Concluída"}</span>
        </button>
      </div>

      {/* Video Player Container */}
      <div className="w-full aspect-video bg-[#0D0E0E] rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-2xl mb-4 relative border border-[#2D2828] flex items-center justify-center">
        {activeAula.type === "dropbox" || activeAula.videoUrl ? (
          <video
            key={activeAula.id}
            controls
            playsInline
            controlsList="nodownload"
            className="w-full h-full object-contain bg-black"
            src={(activeAula.videoUrl || "").replace(/dl=0/g, "raw=1")}
          >
            Seu navegador não suporta a tag de vídeo HTML5.
          </video>
        ) : (
          <iframe 
            src={`https://player.vimeo.com/video/${activeAula.id}?title=0&byline=0&portrait=0${playbackTime > 10 ? `#t=${Math.floor(playbackTime)}s` : ""}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
      </div>

      {/* Indicador do Servidor de Vídeo & Link Externo */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#7F6E6C] px-2 mb-6 gap-2">
        <div className="flex items-center gap-2">
          {activeAula.type === "dropbox" ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Transmissão em Alta Resolução (Dropbox HD)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Transmissão Adaptativa (Vimeo Pro)
            </span>
          )}
        </div>

        {activeAula.type === "dropbox" && activeAula.videoUrl && (
          <a
            href={activeAula.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-bold flex items-center gap-1 text-[11px]"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Abrir vídeo no Dropbox
          </a>
        )}
      </div>

      {/* Barra de Navegação entre Aulas */}
      <div className="flex items-center justify-between gap-4 mb-8 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EAE2E0] shadow-sm">
        <button
          onClick={goToPrev}
          disabled={activeIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#4F4645] hover:text-primary hover:bg-[#FAF7F6] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#4F4645] transition-all"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="hidden sm:inline">Aula Anterior</span>
        </button>

        <span className="text-xs font-bold text-[#7F6E6C]">
          Aula <strong className="text-[#1A1C1C]">{currentIndex}</strong> de <strong className="text-[#1A1C1C]">{aulasList.length}</strong>
        </span>

        <button
          onClick={goToNext}
          disabled={activeIndex === aulasList.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary transition-all shadow-sm"
        >
          <span className="hidden sm:inline">Próxima Aula</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-[24px] border border-[#EAE2E0] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#EAE2E0] bg-[#FAF7F6] overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("materiais")}
            className={`flex-1 py-4 px-5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
              activeTab === "materiais"
                ? "text-primary border-b-2 border-primary bg-white shadow-sm"
                : "text-[#7F6E6C] hover:text-[#1A1C1C]"
            }`}
          >
            <span className="material-symbols-outlined text-base">menu_book</span>
            <span>Materiais &amp; PDFs</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold">2</span>
          </button>

          <button
            onClick={() => setActiveTab("anotacoes")}
            className={`flex-1 py-4 px-5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
              activeTab === "anotacoes"
                ? "text-primary border-b-2 border-primary bg-white shadow-sm"
                : "text-[#7F6E6C] hover:text-[#1A1C1C]"
            }`}
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>Minhas Anotações</span>
            {notes.trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("discussao")}
            className={`flex-1 py-4 px-5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
              activeTab === "discussao"
                ? "text-primary border-b-2 border-primary bg-white shadow-sm"
                : "text-[#7F6E6C] hover:text-[#1A1C1C]"
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>Comunidade &amp; Preceptores</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* ABA 1: MATERIAIS E PDFS */}
          {activeTab === "materiais" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#EAE2E0]">
                <div>
                  <h3 className="text-base font-bold text-[#1A1C1C]">
                    Biblioteca de Materiais Complementares &amp; PDFs
                  </h3>
                  <p className="text-xs text-[#7F6E6C] mt-0.5">
                    Consulte os bancos de questões e tromboelastometrias comentadas a qualquer momento diretamente no leitor ou faça download.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full w-fit">
                  Acesso Vitalício da Turma
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {materiaisList.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-2xl bg-[#FAF7F6] border border-[#E5DCDB] hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-md group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold text-[#7F6E6C] bg-white px-2.5 py-0.5 rounded-full border border-[#E5DCDB]">
                          {item.badge}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#1A1C1C] mb-2 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#5F4E4C] leading-relaxed mb-6">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-[#EAE2E0]">
                      <button
                        onClick={() => setActivePdfModal({ title: item.title, url: item.url })}
                        className="flex-1 py-2.5 px-3.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        <span>Visualizar na Tela</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3.5 rounded-xl bg-white border border-[#E5DCDB] text-[#1A1C1C] text-xs font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        title="Baixar ou abrir em nova aba"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        <span className="hidden sm:inline">Baixar</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 2: ANOTAÇÕES DO ALUNO */}
          {activeTab === "anotacoes" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A1C1C]">
                    Seu Caderno Clínico de Anotações
                  </h3>
                  <p className="text-xs text-[#7F6E6C] mt-0.5">
                    Suas anotações são pessoais, privadas e salvas automaticamente na nuvem para consulta em plantões.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {saveStatus === "saving" && (
                    <span className="text-[#8A7876] flex items-center gap-1 font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Salvando...
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="text-[#059669] flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Salvo na nuvem
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={notes}
                onChange={handleNotesChange}
                rows={10}
                placeholder="Escreva aqui suas anotações médicas, doses práticas, critérios de choque, observações de conduta ou dúvidas para os preceptores..."
                className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-2xl p-4 sm:p-5 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono leading-relaxed resize-y"
              />

              <div className="flex items-center justify-between text-[11px] text-[#8A7876] px-1">
                <span>{notes.length} caracteres digitados</span>
                <span className="italic">💡 Dica: Suas anotações ficam salvas especificamente para esta aula.</span>
              </div>
            </div>
          )}

          {/* ABA 3: DISCUSSÃO E GRUPO VIP */}
          {activeTab === "discussao" && (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">forum</span>
              </div>
              <h3 className="text-lg font-bold text-[#1A1C1C] mb-2">
                Canal VIP de Discussão de Casos Clínicos
              </h3>
              <p className="text-xs text-[#7F6E6C] max-w-md leading-relaxed mb-6">
                Tire dúvidas diretamente com os preceptores e discuta casos reais de plantão no grupo exclusivo de alunos da Turma 2026.
              </p>
              <a
                href="https://t.me/+orWDYtxQRwNmNGEx"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0088CC] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
              >
                <span className="material-symbols-outlined text-base">send</span>
                Entrar no Grupo VIP do Telegram
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Modal Leitor de PDF Embutido */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[24px] overflow-hidden shadow-2xl flex flex-col border border-[#E5DCDB]">
            {/* Header do Leitor */}
            <div className="p-4 sm:p-5 border-b border-[#EAE2E0] bg-[#FAF7F6] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#1A1C1C] truncate">
                  {activePdfModal.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5DCDB] text-xs font-bold text-[#1A1C1C] hover:border-primary hover:text-primary transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  <span className="hidden sm:inline">Abrir em Nova Aba</span>
                </a>
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="p-1.5 rounded-full text-[#7F6E6C] hover:text-[#1A1C1C] hover:bg-[#EAE2E0] transition-colors cursor-pointer"
                  aria-label="Fechar leitor de PDF"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Visualizador de PDF */}
            <div className="flex-1 w-full h-full bg-[#525659] relative">
              <iframe
                src={activePdfModal.url}
                className="w-full h-full border-0"
                title={activePdfModal.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlunoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F6] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AlunoContent />
    </Suspense>
  );
}
