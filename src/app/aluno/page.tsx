"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Player from "@vimeo/player";
import { aulasList } from "@/components/Sidebar";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function AlunoContent() {
  const [activeTab, setActiveTab] = useState<"materiais" | "anotacoes" | "discussao" | "mentoria">("materiais");
  const [activePdfModal, setActivePdfModal] = useState<{ title: string; url: string } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [playbackTime, setPlaybackTime] = useState(0);
  const [dynamicDuration, setDynamicDuration] = useState<string | null>(null);
  const [user, setUser] = useState<{ id?: string; name?: string; email?: string; plan?: string } | null>(null);

  // Estados de experiência inteligente do player
  const [resumeToast, setResumeToast] = useState<{ show: boolean; seconds: number } | null>(null);
  const [completionToast, setCompletionToast] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  const isPremium = user?.plan === "elite" || user?.plan === "premium";

  const materiaisList = [
    {
      id: "banco-questoes",
      title: "Banco de Questões Final",
      description: "Banco completo com questões comentadas de Terapia Intensiva e complicações gastrointestinais para fixação prática e provas de título.",
      category: "Banco de Questões • PDF Oficial",
      url: "https://assets.grupomedcof.com.br/fc5c220a-997c-4333-a4b6-2125c40fd444.pdf",
      badge: "Completo",
      tag: "Plano Básico & Premium",
      isPremiumOnly: false,
    },
    {
      id: "tromboelastometria",
      title: "30 Tromboelastometrias Comentadas",
      description: "Guia clínico com interpretação de 30 traçados de tromboelastometria (TEG/ROTEM) no choque, pós-operatório de grandes cirurgias e transplante.",
      category: "Casos Clínicos • PDF Oficial",
      url: "https://assets.grupomedcof.com.br/7d8777d4-1e78-4d1f-98b6-0ae7f0f7a41b.pdf",
      badge: "30 Casos",
      tag: "Plano Básico & Premium",
      isPremiumOnly: false,
    },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams?.get("v") || aulasList[0].id;

  useEffect(() => {
    setDynamicDuration(null);
    setResumeToast(null);
    setCompletionToast(false);
  }, [activeId]);

  const activeIndex = aulasList.findIndex(a => a.id === activeId || a.vimeoId === activeId);
  const activeAula = aulasList[activeIndex >= 0 ? activeIndex : 0];
  const currentIndex = (activeIndex >= 0 ? activeIndex : 0) + 1;

  // Trava de rolagem da tela de fundo enquanto o leitor de PDF estiver aberto
  useEffect(() => {
    if (activePdfModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [activePdfModal]);

  // Proteção contra inspeção e atalhos de desenvolvedor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

  // Sincronização em tempo real de aulas concluídas com outras instâncias/sidebar
  useEffect(() => {
    const handleProgressUpdate = () => {
      try {
        const localCompleted = localStorage.getItem("gastro_completed_lessons");
        if (localCompleted) setCompletedLessons(JSON.parse(localCompleted));
      } catch {}
    };

    window.addEventListener("gastro_progress_updated", handleProgressUpdate);
    window.addEventListener("storage", handleProgressUpdate);

    return () => {
      window.removeEventListener("gastro_progress_updated", handleProgressUpdate);
      window.removeEventListener("storage", handleProgressUpdate);
    };
  }, []);

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
            const apiTime = Number(data.currentLesson.playbackTime);
            setPlaybackTime(apiTime);
            const localTime = Number(localStorage.getItem(`gastro_time_${activeAula.id}`) || 0);
            if (apiTime > localTime) {
              localStorage.setItem(`gastro_time_${activeAula.id}`, String(apiTime));
            }
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

  // 4. Conclusão Automática da Aula (Auto-Complete ao terminar ou >= 95%)
  const markAsCompleteAuto = useCallback(async () => {
    setCompletedLessons((prev) => {
      if (prev.includes(activeAula.id)) return prev;
      const updated = [...prev, activeAula.id];
      localStorage.setItem("gastro_completed_lessons", JSON.stringify(updated));
      return updated;
    });

    setCompletionToast(true);
    setTimeout(() => {
      setCompletionToast(false);
    }, 8000);

    // Disparar evento para atualizar a Sidebar em tempo real
    window.dispatchEvent(new CustomEvent("gastro_progress_updated", { detail: { lessonId: activeAula.id, completed: true } }));

    // Persistir no servidor
    const userId = user?.id || user?.email || "aluno_dev";
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          lessonId: activeAula.id,
          completed: true,
          notes,
          playbackTime,
        }),
      });
    } catch {}
  }, [activeAula.id, user, notes, playbackTime]);

  // 5. Alternar status de aula concluída manualmente
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
    window.dispatchEvent(new CustomEvent("gastro_progress_updated", { detail: { lessonId: activeAula.id, completed: willBeCompleted } }));

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

  // Salvar progresso na API com debounce
  const savePlaybackToApi = useCallback((seconds: number) => {
    const now = Date.now();
    // Limita envios de rede para no máximo 1 vez a cada 10 segundos
    if (now - lastSaveTimeRef.current < 10000) return;
    lastSaveTimeRef.current = now;

    const userId = user?.id || user?.email || "aluno_dev";
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        lessonId: activeAula.id,
        playbackTime: seconds,
        completed: isCompleted,
      }),
    }).catch(() => {});
  }, [user, activeAula.id, isCompleted]);

  // 6. Integração com Vimeo Player SDK (Continuar de onde parou + Auto-Complete)
  useEffect(() => {
    if (!iframeRef.current) return;

    let isMounted = true;
    let player: Player | null = null;

    try {
      player = new Player(iframeRef.current);
      playerRef.current = player;
    } catch (err) {
      console.warn("Aviso ao instanciar Vimeo Player:", err);
      return;
    }

    player.ready().then(async () => {
      if (!isMounted || !player) return;

      try {
        const duration = await player.getDuration();
        if (duration && !isNaN(duration) && isFinite(duration)) {
          setDynamicDuration(`${Math.round(duration / 60)} min`);
        }

        // Buscar tempo salvo para retomar de onde parou
        let savedPlayback = 0;
        try {
          savedPlayback = Number(localStorage.getItem(`gastro_time_${activeAula.id}`) || 0);
        } catch {}

        // Se o aluno já assistiu mais de 5 segundos e faltar mais de 15 segundos para o fim:
        if (savedPlayback > 5 && savedPlayback < (duration - 15)) {
          await player.setCurrentTime(savedPlayback);
          if (isMounted) {
            setResumeToast({ show: true, seconds: savedPlayback });

            // Auto-ocultar o toast de retomada após 7 segundos
            setTimeout(() => {
              if (isMounted) {
                setResumeToast((prev) => (prev ? { ...prev, show: false } : null));
              }
            }, 7000);
          }
        }
      } catch (e) {
        console.warn("Aviso ao recuperar estado do Vimeo:", e);
      }
    }).catch((err) => {
      console.warn("Aviso Vimeo player ready:", err);
    });

    // Evento de atualização periódica de tempo
    const onTimeUpdate = (data: { seconds: number; percent: number; duration: number }) => {
      if (!isMounted) return;
      const currentSec = Math.floor(data.seconds);
      setPlaybackTime(currentSec);
      try {
        localStorage.setItem(`gastro_time_${activeAula.id}`, String(currentSec));
      } catch {}

      savePlaybackToApi(currentSec);

      // Auto-complete: marcar como concluída se assistir 95% ou mais
      if (data.percent >= 0.95 && !isCompleted) {
        markAsCompleteAuto();
      }
    };

    // Evento de término do vídeo
    const onEnded = () => {
      if (!isMounted) return;
      markAsCompleteAuto();
    };

    // Evento de pausa (aproveita para salvar no backend)
    const onPause = (data: { seconds: number }) => {
      if (!isMounted) return;
      savePlaybackToApi(Math.floor(data.seconds));
    };

    player.on("timeupdate", onTimeUpdate);
    player.on("ended", onEnded);
    player.on("pause", onPause);

    return () => {
      isMounted = false;
      if (player) {
        try {
          player.off("timeupdate", onTimeUpdate);
          player.off("ended", onEnded);
          player.off("pause", onPause);
          // NÃO chama player.destroy() para não remover o iframe da árvore gerenciada pelo React
          player.unload().catch(() => {});
        } catch {}
      }
    };
  }, [activeAula.id, isCompleted, markAsCompleteAuto, savePlaybackToApi]);

  // Função para reiniciar o vídeo do início
  const handleRestartFromBeginning = async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.setCurrentTime(0);
        setPlaybackTime(0);
        localStorage.setItem(`gastro_time_${activeAula.id}`, "0");
        setResumeToast(null);
      } catch (e) {
        console.error("Erro ao reiniciar vídeo:", e);
      }
    }
  };

  // 7. Salvar anotações do aluno (auto-save com debounce)
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-container-max mx-auto w-full">
      {/* Header com Breadcrumb, Título e Ações */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-primary uppercase tracking-wider mb-2 flex-wrap">
            <span className="font-bold">{activeAula.module}</span>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface-variant font-medium">{activeAula.professor}</span>
            <span className="text-outline-variant">•</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeAula.year === 2026 ? "bg-primary/10 text-primary border border-primary/20" : "bg-surface-container-high text-secondary"
            }`}>
              {activeAula.year === 2026 ? "Turma 2026" : "Acervo 2025"}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-secondary font-medium">{dynamicDuration || activeAula.duration}</span>
          </div>
          <h1 className="text-headline-md sm:text-headline-lg font-bold text-on-background tracking-tight">
            {currentIndex}. {activeAula.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {activeAula.slidesUrl && (
            <div className="flex items-center gap-1 bg-surface-container-lowest rounded-full p-1 border border-outline-variant/50 shadow-sm">
              <button
                onClick={() => setActivePdfModal({ title: `Slides - ${activeAula.title}`, url: activeAula.slidesUrl! })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-xs sm:text-sm text-on-background hover:text-primary transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-base">picture_as_pdf</span>
                <span>Slides</span>
              </button>
              <a
                href={`/api/download?url=${encodeURIComponent(activeAula.slidesUrl!)}&name=${encodeURIComponent(activeAula.title + "_Slides.pdf")}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                title="Baixar Slides da Aula (PDF)"
                className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">download</span>
              </a>
            </div>
          )}

          {/* Botão de Marcar como Concluída */}
          <button
            onClick={toggleComplete}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-label-md transition-all shadow-sm flex-shrink-0 cursor-pointer active:scale-95 ${
              isCompleted
                ? "bg-tertiary/10 text-tertiary border border-tertiary/30 hover:bg-tertiary/20 font-bold"
                : "bg-surface-container-lowest text-on-background border border-outline-variant/50 hover:border-primary hover:text-primary"
            }`}
          >
            <span className={`material-symbols-outlined ${isCompleted ? "text-tertiary" : "text-secondary"}`}>
              {isCompleted ? "check_circle" : "radio_button_unchecked"}
            </span>
            <span>{isCompleted ? "Aula Concluída" : "Marcar como Concluída"}</span>
          </button>
        </div>
      </div>

      {/* Video Player Container com Proteção e Experiência Inteligente */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className="w-full aspect-video bg-[#0D0E0E] rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl mb-4 relative border border-[#2D2828] flex items-center justify-center select-none"
      >
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            key={activeAula.vimeoId || activeAula.id}
            src={`https://player.vimeo.com/video/${activeAula.vimeoId || activeAula.id}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`}
            className="w-full h-full border-0 absolute inset-0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowFullScreen
            title={activeAula.title}
          />

          {/* Notificação Visual: Continuar de Onde Parou */}
          {resumeToast?.show && (
            <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-30 bg-[#1A1C1C]/95 text-white p-3 sm:px-4 sm:py-2.5 rounded-xl border border-primary/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 max-w-md">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                <span className="material-symbols-outlined text-primary text-base">history</span>
                <span>Retomando de <strong>{formatTime(resumeToast.seconds)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleRestartFromBeginning}
                  className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Do início
                </button>
                <button
                  onClick={() => setResumeToast(null)}
                  className="p-1 rounded-lg text-secondary hover:text-white transition-colors cursor-pointer"
                  title="Dispensar"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Notificação Visual: Aula Concluída Automaticamente */}
          {completionToast && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-30 bg-[#002020]/95 text-white p-4 rounded-xl border border-tertiary/50 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-md">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">Aula Concluída!</p>
                  <p className="text-[11px] text-tertiary-fixed">Marcada automaticamente na lista.</p>
                </div>
              </div>
              {activeIndex < aulasList.length - 1 && (
                <button
                  onClick={goToNext}
                  className="px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Próxima</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Indicador do Servidor de Vídeo Seguro */}
      <div className="flex flex-wrap items-center justify-between font-label-sm text-secondary px-2 mb-6 gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 font-semibold text-tertiary bg-tertiary/10 px-3 py-1 rounded-full border border-tertiary/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            Transmissão Oficial MedCof (Vimeo HD)
          </span>
          {playbackTime > 0 && (
            <span className="font-label-sm text-secondary text-xs">
              Tempo assistido: <strong className="text-on-background">{formatTime(playbackTime)}</strong>
            </span>
          )}
        </div>

        <span className="text-secondary font-medium flex items-center gap-1 text-xs">
          <span className="material-symbols-outlined text-secondary text-sm">lock</span>
          Ambiente Protegido MedCof
        </span>
      </div>

      {/* Barra de Navegação entre Aulas */}
      <div className="flex items-center justify-between gap-4 mb-8 bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-sm">
        <button
          onClick={goToPrev}
          disabled={activeIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-secondary hover:text-primary hover:bg-surface-container-low disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="hidden sm:inline">Aula Anterior</span>
        </button>

        <span className="font-label-md text-secondary text-sm">
          Aula <strong className="text-on-background font-bold">{currentIndex}</strong> de <strong className="text-on-background font-bold">{aulasList.length}</strong>
        </span>

        <button
          onClick={goToNext}
          disabled={activeIndex === aulasList.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary transition-all shadow-sm cursor-pointer"
        >
          <span className="hidden sm:inline">Próxima Aula</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {/* Content Tabs */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high shadow-sm overflow-hidden">
        <div className="flex border-b border-surface-container-high bg-surface-container-low overflow-x-auto scrollbar-none modal-scroll touch-pan-x">
          <button
            onClick={() => setActiveTab("materiais")}
            className={`flex-1 py-4 px-5 font-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === "materiais"
                ? "text-primary border-b-2 border-primary bg-surface-container-lowest font-bold shadow-sm"
                : "text-secondary hover:text-on-background font-medium"
            }`}
          >
            <span className="material-symbols-outlined">folder</span>
            <span>Materiais &amp; PDFs</span>
          </button>

          <button
            onClick={() => setActiveTab("anotacoes")}
            className={`flex-1 py-4 px-5 font-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === "anotacoes"
                ? "text-primary border-b-2 border-primary bg-surface-container-lowest font-bold shadow-sm"
                : "text-secondary hover:text-on-background font-medium"
            }`}
          >
            <span className="material-symbols-outlined">edit_note</span>
            <span>Minhas Anotações</span>
            {notes.trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("discussao")}
            className={`flex-1 py-4 px-5 font-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === "discussao"
                ? "text-primary border-b-2 border-primary bg-surface-container-lowest font-bold shadow-sm"
                : "text-secondary hover:text-on-background font-medium"
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span>Comunidade &amp; Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab("mentoria")}
            className={`flex-1 py-4 px-5 font-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === "mentoria"
                ? "text-primary border-b-2 border-primary bg-surface-container-lowest font-bold shadow-sm"
                : "text-secondary hover:text-on-background font-medium"
            }`}
          >
            <span className="material-symbols-outlined">video_camera_front</span>
            <span>Mentoria ao Vivo</span>
            {isPremium ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-label-sm font-bold border border-amber-300">VIP</span>
            ) : (
              <span className="material-symbols-outlined text-secondary">lock</span>
            )}
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* ABA 1: MATERIAIS E PDFS */}
          {activeTab === "materiais" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-surface-container-high">
                <div>
                  <h3 className="text-headline-md font-bold text-on-background">
                    Biblioteca de Materiais Complementares &amp; PDFs
                  </h3>
                  <p className="font-label-md text-secondary mt-1">
                    Consulte os bancos de questões e tromboelastometrias comentadas a qualquer momento diretamente no leitor protegido.
                  </p>
                </div>
                <span className="font-label-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full w-fit">
                  Acesso Vitalício da Turma
                </span>
              </div>

              {activeAula.slidesUrl && (
                <div className="p-5 sm:p-6 rounded-xl border border-primary/30 bg-primary-fixed/20 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined">slideshow</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-sm font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          Slides da Aula Atual
                        </span>
                        <span className="font-label-sm font-bold text-secondary">PDF Oficial</span>
                      </div>
                      <h4 className="font-title-md font-bold text-on-background mt-1">
                        {activeAula.title}
                      </h4>
                      <p className="font-label-md text-secondary mt-0.5">
                        Material em slides para acompanhamento e revisão dos conceitos clínicos da aula.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    <button
                      onClick={() => setActivePdfModal({ title: `Slides - ${activeAula.title}`, url: activeAula.slidesUrl! })}
                      className="py-2.5 px-4 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer active:scale-95 text-xs sm:text-sm"
                    >
                      <span className="material-symbols-outlined text-base">menu_book</span>
                      <span>Visualizar Slides</span>
                    </button>
                    <a
                      href={`/api/download?url=${encodeURIComponent(activeAula.slidesUrl!)}&name=${encodeURIComponent(activeAula.title + "_Slides.pdf")}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 rounded-lg bg-surface-container-lowest text-primary border border-primary/30 hover:bg-primary/5 font-label-md font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer active:scale-95 text-xs sm:text-sm"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Baixar PDF</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {materiaisList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-xl border border-surface-container-high bg-surface-container-lowest hover:border-outline-variant transition-all flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-label-sm text-secondary font-medium uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="font-label-sm font-bold px-2.5 py-0.5 rounded-full bg-surface-container-low text-secondary border border-surface-container-high">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="font-title-md font-bold text-on-background">
                        {item.title}
                      </h4>
                      <p className="font-label-md text-secondary leading-relaxed mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-surface-container-low flex flex-col gap-2.5">
                      <div className="flex items-center justify-between font-label-sm text-secondary text-xs">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
                          {item.tag}
                        </span>
                        <span className="font-medium">Material Oficial MedCof</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => setActivePdfModal({ title: item.title, url: item.url })}
                          className="py-2.5 px-3 rounded-lg bg-primary text-on-primary font-label-md text-xs sm:text-sm font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                          <span>Visualizar</span>
                        </button>
                        <a
                          href={`/api/download?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(item.title + ".pdf")}`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-lg bg-surface-container-low text-on-background hover:text-primary border border-surface-container-high hover:border-primary/40 font-label-md text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base text-primary">download</span>
                          <span>Baixar PDF</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 2: MINHAS ANOTAÇÕES */}
          {activeTab === "anotacoes" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-surface-container-high">
                <div>
                  <h3 className="text-headline-md font-bold text-on-background">
                    Caderno Digital de Anotações Clínicas
                  </h3>
                  <p className="font-label-md text-secondary mt-1">
                    Suas anotações são salvas automaticamente na nuvem enquanto você digita e vinculadas a esta aula ({activeAula.title}).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {saveStatus === "saving" && (
                    <span className="font-label-sm text-primary font-bold flex items-center gap-1.5 animate-pulse bg-primary/10 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Salvando na nuvem...
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="font-label-sm text-tertiary font-bold flex items-center gap-1.5 bg-tertiary/10 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined">done</span>
                      Salvo automaticamente
                    </span>
                  )}
                  {saveStatus === "idle" && (
                    <span className="font-label-sm text-secondary flex items-center gap-1 bg-surface-container-low px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined">cloud_done</span>
                      Sincronizado
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Escreva aqui suas observações, esquemas de conduta, pontos de atenção para o plantão e resumos desta aula..."
                  rows={12}
                  className="w-full p-4 rounded-xl border border-surface-container-high focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-background resize-y placeholder:text-secondary/60 bg-surface-container-lowest"
                />
              </div>

              <div className="flex items-center justify-between font-label-sm text-secondary">
                <span>{notes.length} caracteres digitados</span>
                <span className="italic">💡 Dica: Suas anotações ficam salvas especificamente para esta aula.</span>
              </div>
            </div>
          )}

          {/* ABA 3: COMUNIDADE E TELEGRAM */}
          {activeTab === "discussao" && (
            <div className="flex flex-col items-center justify-center text-center py-10 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#0088CC]/10 text-[#0088CC] flex items-center justify-center mb-4 shadow-sm border border-[#0088CC]/20">
                <span className="material-symbols-outlined text-4xl">send</span>
              </div>
              <span className="font-label-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#0088CC] border border-blue-200 mb-3">
                Comunidade Oficial • Turma 2026
              </span>
              <h3 className="text-headline-md font-bold text-on-background mb-2">
                Grupo Oficial no Telegram
              </h3>
              <p className="font-body-md text-secondary leading-relaxed mb-6">
                Tire dúvidas diretamente com os preceptores, discuta condutas em casos complexos de plantão e receba atualizações científicas e artigos comentados semanalmente.
              </p>
              <a
                href="https://t.me/+orWDYtxQRwNmNGEx"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0088CC] text-white font-label-md font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined">send</span>
                <span>Entrar no Grupo do Telegram</span>
              </a>
            </div>
          )}

          {/* ABA 4: MENTORIA AO VIVO */}
          {activeTab === "mentoria" && (
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <h3 className="text-headline-md font-bold text-on-background">
                    Programa de Mentoria com Coordenadores
                  </h3>
                  <span className="font-label-sm font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                    2 Reuniões Online
                  </span>
                </div>
                <p className="font-label-md text-secondary mt-1">
                  Encontros ao vivo fechados diretamente com os coordenadores médicos do HCFMUSP.
                </p>
              </div>

              {isPremium ? (
                <div className="flex flex-col gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-surface-container-low border border-amber-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined">verified</span>
                      </span>
                      <div>
                        <h4 className="font-title-md font-bold text-on-background">
                          Sua Vaga na Mentoria Está Garantida!
                        </h4>
                        <p className="font-label-sm text-secondary">
                          Turma 2026 • 2 Sessões Online ao Vivo com os 4 Coordenadores
                        </p>
                      </div>
                    </div>
                    <p className="font-body-md text-secondary leading-relaxed mb-4">
                      Nas reuniões de mentoria, você terá contato direto com os coordenadores para discussão de condutas em casos limítrofes, organização de fluxos de UTI e direcionamento profissional. Os links de acesso privado (Zoom / Google Meet) e as datas oficiais serão enviados pelo seu e-mail cadastrado e anunciados no Grupo VIP do Telegram.
                    </p>
                    <div className="p-3 bg-surface-container-lowest rounded-lg border border-amber-200 flex items-center gap-2 font-label-md font-semibold text-amber-950">
                      <span className="material-symbols-outlined text-amber-700">schedule</span>
                      <span>Você será notificado com 7 dias de antecedência para agendamento dos encontros.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { name: "Dra. Bruna Carla", role: "Coord. Médica • HCFMUSP" },
                      { name: "Dr. Lucas Araújo", role: "Coord. Médico • HCFMUSP" },
                      { name: "Dra. Paula Sepulveda", role: "Coord. Médica • HCFMUSP" },
                      { name: "Dr. Rodolpho Pedro", role: "Coord. Médico • HCFMUSP" },
                    ].map((doc) => (
                      <div key={doc.name} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto mb-2 flex items-center justify-center font-bold font-label-md">
                          {doc.name.split(" ")[1]?.[0] || "M"}
                        </div>
                        <p className="font-label-md font-bold text-on-background">{doc.name}</p>
                        <p className="font-label-sm text-secondary">{doc.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 sm:p-10 rounded-xl bg-surface-container-low border border-surface-container-high text-center flex flex-col items-center max-w-xl mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-4 border border-amber-300">
                    <span className="material-symbols-outlined text-3xl">lock</span>
                  </div>
                  <h4 className="text-headline-md font-bold text-on-background mb-2">
                    Mentoria Exclusiva do Plano Premium
                  </h4>
                  <p className="font-body-md text-secondary leading-relaxed mb-6">
                    As 2 reuniões online ao vivo diretamente com os coordenadores médicos do HCFMUSP fazem parte da Formação Avançada + Mentoria (Plano Premium). Faça o upgrade do seu plano para participar das sessões exclusivas de discussão.
                  </p>
                  <a
                    href="/#planos"
                    className="px-6 py-3 rounded-full bg-primary text-on-primary font-label-md font-bold uppercase tracking-wider hover:bg-primary-container transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined">upgrade</span>
                    <span>Fazer Upgrade para Plano Premium</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Leitor de PDF com Suporte Completo a Mobile e Download */}
      {activePdfModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="bg-surface-container-lowest w-full max-w-5xl h-[92dvh] sm:h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-0 border border-surface-container-high my-auto">
            {/* Header do Leitor */}
            <div className="p-3 sm:p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between gap-2 sm:gap-4 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                </span>
                <h3 id="pdf-modal-title" className="font-label-md sm:font-title-sm font-bold text-on-background truncate">
                  {activePdfModal.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Botão Baixar PDF */}
                <a
                  href={`/api/download?url=${encodeURIComponent(activePdfModal.url)}&name=${encodeURIComponent(activePdfModal.title + ".pdf")}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-xs font-bold shadow-sm hover:bg-primary-container transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Baixar arquivo PDF"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span className="hidden xs:inline sm:inline">Baixar PDF</span>
                </a>

                {/* Botão Abrir em Nova Aba */}
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest text-secondary hover:text-on-background border border-surface-container-high font-label-sm text-xs font-semibold transition-all shrink-0"
                  title="Abrir em nova aba / tela cheia"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  <span>Nova Aba</span>
                </a>

                {/* Botão Fechar */}
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="w-10 h-10 rounded-full text-secondary hover:text-on-background hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95"
                  aria-label="Fechar leitor de PDF"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Visualizador de PDF com Fallback Nativo */}
            <div className="flex-1 w-full bg-[#323639] relative overflow-hidden flex flex-col">
              <iframe
                src={`${activePdfModal.url}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0 flex-1"
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AlunoContent />
    </Suspense>
  );
}
