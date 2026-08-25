import { NextResponse } from "next/server";
import { getRuntimeEnv, type D1Binding } from "@/lib/cloudflare-env";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

interface ProgressRow {
  lesson_id: string;
  completed: number;
  playback_time?: number;
  notes?: string;
}

interface UserRow {
  last_lesson_id?: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const lessonId = searchParams.get("lessonId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId é obrigatório" },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  const db: D1Binding | undefined = getRuntimeEnv().DB;

  if (!db) {
    return NextResponse.json(
      { error: "Banco de dados indisponível" },
      { status: 503, headers: NO_CACHE_HEADERS }
    );
  }

  try {
    // 1. Obter todas as aulas concluídas pelo aluno
    const completedStmt = db.prepare(
      "SELECT lesson_id FROM Progress WHERE user_id = ? AND completed = 1"
    );
    const { results: completedResults } = await completedStmt.bind(userId).all<ProgressRow>();
    const completedLessons = (completedResults || []).map((row) => row.lesson_id);

    // 2. Obter a última aula assistida pelo aluno
    const userStmt = db.prepare("SELECT last_lesson_id FROM Users WHERE id = ?");
    const user = await userStmt.bind(userId).first<UserRow>();

    // 3. Obter progresso e anotações da aula atual se informada
    let currentLesson = { completed: false, playbackTime: 0, notes: "" };
    if (lessonId) {
      const lessonStmt = db.prepare(
        "SELECT completed, playback_time, notes FROM Progress WHERE user_id = ? AND lesson_id = ?"
      );
      const row = await lessonStmt.bind(userId, lessonId).first<ProgressRow>();
      if (row) {
        currentLesson = {
          completed: Boolean(row.completed),
          playbackTime: row.playback_time || 0,
          notes: row.notes || "",
        };
      }
    }

    return NextResponse.json(
      {
        success: true,
        completedLessons,
        lastLessonId: user?.last_lesson_id || null,
        currentLesson,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Erro na API de Progresso (GET):", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, lessonId, completed, playbackTime, notes } = await req.json();

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: "userId e lessonId são obrigatórios" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const db: D1Binding | undefined = getRuntimeEnv().DB;

    if (!db) {
      return NextResponse.json(
        { error: "Banco de dados indisponível" },
        { status: 503, headers: NO_CACHE_HEADERS }
      );
    }

    // 1. Atualizar ou criar registro na tabela Progress
    const id = `${userId}_${lessonId}`;
    const checkStmt = db.prepare("SELECT id, completed, playback_time, notes FROM Progress WHERE user_id = ? AND lesson_id = ?");
    const existing = await checkStmt.bind(userId, lessonId).first<ProgressRow>();

    const finalCompleted = completed !== undefined ? (completed ? 1 : 0) : (existing?.completed ?? 0);
    const finalPlayback = playbackTime !== undefined ? Number(playbackTime) : (existing?.playback_time ?? 0);
    const finalNotes = notes !== undefined ? String(notes) : (existing?.notes ?? "");

    if (!existing) {
      const insertStmt = db.prepare(
        `INSERT INTO Progress (id, user_id, lesson_id, completed, playback_time, notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      );
      await insertStmt.bind(id, userId, lessonId, finalCompleted, finalPlayback, finalNotes).run();
    } else {
      const updateStmt = db.prepare(
        `UPDATE Progress 
         SET completed = ?, playback_time = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND lesson_id = ?`
      );
      await updateStmt.bind(finalCompleted, finalPlayback, finalNotes, userId, lessonId).run();
    }

    // 2. Atualizar a última aula assistida do usuário
    try {
      const updateUserStmt = db.prepare("UPDATE Users SET last_lesson_id = ? WHERE id = ?");
      await updateUserStmt.bind(lessonId, userId).run();
    } catch {}

    return NextResponse.json(
      {
        success: true,
        userId,
        lessonId,
        completed: Boolean(finalCompleted),
        playbackTime: finalPlayback,
        notes: finalNotes,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Erro na API de Progresso (POST):", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
