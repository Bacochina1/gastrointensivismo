/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRuntimeEnv } from "@/lib/cloudflare-env";
import { verifyPassword, hashPassword } from "@/lib/auth-utils";
import { createStripeRefund } from "@/lib/stripe-edge";
import { refundMercadoPagoPayment } from "@/lib/mercadopago";
import { sendRefundAdminNotification, sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "gastro_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

const NO_CACHE = {
  "Cache-Control": "private, no-cache, no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function makeAdminSessionToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

function adminCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

function clearAdminCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function getAdminToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1] || null;
}

async function q(db: any, sql: string, ...args: any[]): Promise<any> {
  return db.prepare(sql).bind(...args).first();
}

async function run(db: any, sql: string, ...args: any[]): Promise<void> {
  await db.prepare(sql).bind(...args).run().catch(() => {});
}

async function all(db: any, sql: string, ...args: any[]): Promise<any[]> {
  const result = await db.prepare(sql).bind(...args).all();
  return result?.results || [];
}

async function ensureAdminTable(db: any): Promise<void> {
  await run(db, "CREATE TABLE IF NOT EXISTS AdminSessions (token TEXT PRIMARY KEY, expires_at INTEGER)");
}

async function validateAdminSession(token: string | null, db: any): Promise<boolean> {
  if (!token || token.length < 32) return false;
  try {
    const row = await q(db,
      "SELECT token FROM AdminSessions WHERE token = ? AND expires_at > strftime('%s','now')",
      token
    );
    return !!row;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const env = getRuntimeEnv();
  const db = env.DB as any;

  if (!db) {
    return Response.json({ error: "DB nao configurado" }, { status: 503, headers: NO_CACHE });
  }

  try {
    const body = await req.json() as { 
      action?: string; 
      password?: string; 
      userId?: string; 
      reason?: string; 
      hasAccess?: number; 
    };
    const { action, password } = body;

    if (action === "logout") {
      const token = getAdminToken(req);
      if (token) {
        await run(db, "DELETE FROM AdminSessions WHERE token = ?", token);
      }
      const res = Response.json({ success: true }, { headers: NO_CACHE });
      res.headers.append("Set-Cookie", clearAdminCookie());
      return res;
    }

    if (action === "login") {
      if (!password) {
        return Response.json({ error: "Senha obrigatoria" }, { status: 400, headers: NO_CACHE });
      }

      const adminHashEnv = env.ADMIN_PASSWORD_HASH as string | undefined;
      if (!adminHashEnv) {
        console.error("[Admin Login] ADMIN_PASSWORD_HASH nao configurado.");
        return Response.json({ error: "Admin nao configurado. Contate o suporte." }, { status: 503, headers: NO_CACHE });
      }

      const isValid = await verifyPassword(password, adminHashEnv);
      if (!isValid) {
        return Response.json({ error: "Senha incorreta" }, { status: 401, headers: NO_CACHE });
      }

      await ensureAdminTable(db);

      const token = makeAdminSessionToken();
      const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;

      await run(db, "INSERT OR REPLACE INTO AdminSessions (token, expires_at) VALUES (?, ?)", token, expiresAt);
      await run(db, "DELETE FROM AdminSessions WHERE expires_at <= strftime('%s','now')");

      const res = Response.json({ success: true }, { headers: NO_CACHE });
      res.headers.append("Set-Cookie", adminCookie(token));
      return res;
    }

    // Ações administrativas que exigem autenticação prévia
    const token = getAdminToken(req);
    await ensureAdminTable(db);
    const isValid = await validateAdminSession(token, db);
    if (!isValid) {
      return Response.json({ error: "Nao autorizado" }, { status: 401, headers: NO_CACHE });
    }

    // 1. REEMBOLSO VIA STRIPE & REVOGAÇÃO DE ACESSO
    if (action === "refund") {
      const { userId, reason } = body;
      if (!userId) {
        return Response.json({ error: "ID do usuario obrigatorio" }, { status: 400, headers: NO_CACHE });
      }

      const user = await q(db, "SELECT id, name, email, plan, stripe_id, has_access FROM Users WHERE id = ?", userId);
      if (!user) {
        return Response.json({ error: "Usuario nao encontrado" }, { status: 404, headers: NO_CACHE });
      }

      let refundId = "MANUAL_REVOKE";
      let stripeSuccess = false;
      const stripeKey = env.STRIPE_SECRET_KEY as string | undefined;

      const mpToken = env.MERCADO_PAGO_ACCESS_TOKEN as string | undefined;
      const isNumericId = user.stripe_id && /^\d+$/.test(user.stripe_id.trim());

      if (isNumericId && mpToken) {
        try {
          const mpRefund = await refundMercadoPagoPayment(mpToken, user.stripe_id.trim());
          refundId = String(mpRefund.id);
          stripeSuccess = true;
        } catch (mpErr: any) {
          console.error("[Admin Refund MP Error]:", mpErr);
          const msg = mpErr?.message || "";
          return Response.json({
            error: `Erro retornado pelo Mercado Pago: ${msg}`
          }, { status: 400, headers: NO_CACHE });
        }
      } else if (user.stripe_id && stripeKey) {
        try {
          const refundResult = await createStripeRefund(
            stripeKey,
            user.stripe_id,
            (reason as any) || "requested_by_customer"
          );
          refundId = refundResult.id;
          stripeSuccess = true;
        } catch (stripeErr: any) {
          console.error("[Admin Refund Stripe Error]:", stripeErr);
          const msg = stripeErr?.message || "";
          // Se já foi estornado na Stripe, ainda assim garantimos que o acesso seja bloqueado no D1
          if (msg.includes("already been refunded") || msg.includes("already refunded")) {
            refundId = "ALREADY_REFUNDED";
            stripeSuccess = true;
          } else {
            return Response.json({ 
              error: `Erro retornado pela Stripe: ${msg}` 
            }, { status: 400, headers: NO_CACHE });
          }
        }
      }

      // Revoga o acesso no banco D1
      await run(db, "UPDATE Users SET has_access = 0 WHERE id = ?", userId);

      // Notifica o suporte por e-mail
      try {
        await sendRefundAdminNotification({
          name: user.name || "Aluno",
          email: user.email,
          plan: user.plan || "regular",
          refundId,
        });
      } catch {}

      return Response.json({
        success: true,
        refunded: stripeSuccess,
        refundId,
        message: stripeSuccess
          ? "Reembolso executado com sucesso na Stripe e acesso revogado."
          : "Acesso revogado no sistema (sem transacao Stripe vinculada).",
      }, { headers: NO_CACHE });
    }

    // 2. TOGGLE DE ACESSO MANUAL (Bloquear / Desbloquear)

    // 3. SINCRONIZAR VENDAS DO MERCADO PAGO DIRETAMENTE NO CRM
    if (action === "sync_mercadopago") {
      const mpToken = env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!mpToken) {
        return Response.json({ error: "MERCADO_PAGO_ACCESS_TOKEN nao configurado" }, { status: 400, headers: NO_CACHE });
      }

      try {
        const searchRes = await fetch("https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=50&status=approved", {
          headers: { Authorization: `Bearer ${mpToken}` }
        });
        const searchData = await searchRes.json() as any;
        const payments = searchData?.results || [];

        let newUsers = 0;
        let updatedUsers = 0;

        for (const p of payments) {
          const email = p.payer?.email?.toLowerCase().trim();
          if (!email) continue;

          const addInfoPayer = p.additional_info?.payer;
          const firstName = p.payer?.first_name || addInfoPayer?.first_name || "";
          const lastName = p.payer?.last_name || addInfoPayer?.last_name || "";
          let name = `${firstName} ${lastName}`.trim();
          if (!name && p.card?.cardholder?.name) name = p.card.cardholder.name;
          if (!name) name = "Aluno Gastrointensivismo";

          const phoneObj = p.payer?.phone || addInfoPayer?.phone;
          let phone: string | null = null;
          if (phoneObj) {
            const ddd = phoneObj.area_code ? `(${phoneObj.area_code}) ` : "";
            phone = `${ddd}${phoneObj.number || ""}`.trim() || null;
          }

          const plan = p.metadata?.plan === "elite" || p.metadata?.product === "gastro_elite" ? "elite" : "regular";
          const paymentId = String(p.id);

          const existing = await q(db, "SELECT id, password_hash, has_access FROM Users WHERE LOWER(TRIM(email)) = ?", email);
          if (existing) {
            await run(db, "UPDATE Users SET has_access = 1, plan = ?, stripe_id = COALESCE(stripe_id, ?), phone = COALESCE(?, phone) WHERE id = ?", plan, paymentId, phone, existing.id);
            updatedUsers++;
          } else {
            const userId = crypto.randomUUID();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const tempPassword = `Gastro#${randomCode}!`;
            const tempPasswordHash = await hashPassword(tempPassword);

            await run(db, "INSERT INTO Users (id, name, email, phone, password_hash, has_access, must_change_password, stripe_id, plan) VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)",
              userId, name, email, phone, tempPasswordHash, paymentId, plan
            );

            // Envia e-mail oficial com credenciais
            sendWelcomeEmail({
              to: email,
              name,
              tempPassword,
              loginUrl: "https://gastrointensivismo.com.br/login?temp=true"
            }).catch(() => {});

            newUsers++;
          }
        }

        return Response.json({
          success: true,
          totalPayments: payments.length,
          newUsers,
          updatedUsers,
          message: `Sincronizacao concluida: ${payments.length} pagamentos processados (${newUsers} novos alunos cadastrados, ${updatedUsers} atualizados).`
        }, { headers: NO_CACHE });
      } catch (err: any) {
        console.error("[Admin Sync MP Error]:", err);
        return Response.json({ error: `Erro ao sincronizar com Mercado Pago: ${err.message}` }, { status: 500, headers: NO_CACHE });
      }
    }

    if (action === "toggle_access") {
      const { userId, hasAccess } = body;
      if (!userId || hasAccess === undefined) {
        return Response.json({ error: "Parametros invalidos" }, { status: 400, headers: NO_CACHE });
      }

      const newAccess = hasAccess ? 1 : 0;
      await run(db, "UPDATE Users SET has_access = ? WHERE id = ?", newAccess, userId);
      return Response.json({ success: true, hasAccess: newAccess }, { headers: NO_CACHE });
    }

    return Response.json({ error: "Acao invalida" }, { status: 400, headers: NO_CACHE });
  } catch (e) {
    console.error("[Admin POST]", e);
    return Response.json({ error: "Erro interno" }, { status: 500, headers: NO_CACHE });
  }
}

export async function GET(req: Request) {
  const env = getRuntimeEnv();
  const db = env.DB as any;

  if (!db) {
    return Response.json({ error: "DB nao configurado" }, { status: 503, headers: NO_CACHE });
  }

  const token = getAdminToken(req);
  await ensureAdminTable(db);

  const isValid = await validateAdminSession(token, db);
  if (!isValid) {
    return Response.json({ error: "Nao autorizado" }, { status: 401, headers: NO_CACHE });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "users";

  try {
    if (action === "stats") {
      const [totalRow, activeRow, premiumRow, basicRow, phoneRow] = await Promise.all([
        q(db, "SELECT COUNT(*) as n FROM Users WHERE is_admin = 0"),
        q(db, "SELECT COUNT(*) as n FROM Users WHERE has_access = 1 AND is_admin = 0"),
        q(db, "SELECT COUNT(*) as n FROM Users WHERE plan = 'elite' AND has_access = 1 AND is_admin = 0"),
        q(db, "SELECT COUNT(*) as n FROM Users WHERE plan = 'regular' AND has_access = 1 AND is_admin = 0"),
        q(db, "SELECT COUNT(*) as n FROM Users WHERE phone IS NOT NULL AND phone != '' AND is_admin = 0"),
      ]);

      return Response.json({
        total: totalRow?.n || 0,
        active: activeRow?.n || 0,
        premium: premiumRow?.n || 0,
        basic: basicRow?.n || 0,
        withPhone: phoneRow?.n || 0,
      }, { headers: NO_CACHE });
    }

    if (action === "users") {
      const search = url.searchParams.get("search") || "";
      const filter = url.searchParams.get("filter") || "all";
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      let where = "WHERE u.is_admin = 0";
      const binds: (string | number)[] = [];

      if (filter === "regular") where += " AND u.plan = 'regular'";
      if (filter === "elite") where += " AND u.plan = 'elite'";

      if (search.trim()) {
        where += " AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR u.phone LIKE ?)";
        const s = `%${search.toLowerCase()}%`;
        binds.push(s, s, s);
      }

      const countRow = await q(db,
        `SELECT COUNT(*) as n FROM Users u ${where}`,
        ...binds
      );

      const users = await all(db,
        `SELECT u.id, u.name, u.email, u.phone, u.plan, u.has_access, u.stripe_id,
                u.created_at,
                COUNT(CASE WHEN p.completed = 1 THEN 1 END) as lessons_done
         FROM Users u
         LEFT JOIN Progress p ON p.user_id = u.id
         ${where}
         GROUP BY u.id
         ORDER BY u.created_at DESC
         LIMIT ? OFFSET ?`,
        ...binds, pageSize, offset
      );

      return Response.json({
        users,
        total: countRow?.n || 0,
        page,
        pageSize,
      }, { headers: NO_CACHE });
    }

    return Response.json({ error: "Acao desconhecida" }, { status: 400, headers: NO_CACHE });
  } catch (e) {
    console.error("[Admin GET]", e);
    return Response.json({ error: "Erro ao consultar dados" }, { status: 500, headers: NO_CACHE });
  }
}
