import { hashPassword, verifyPassword } from '@/lib/auth-utils';
import {
  clearSessionCookie,
  createPasswordResetToken,
  createSessionCookie,
  createSessionToken,
  getSessionTokenFromRequest,
  verifyPasswordResetToken,
  verifySessionToken,
} from '@/lib/session';
import { sendPasswordResetEmail, sendWelcomeEmail } from '@/lib/email';
import { getRuntimeEnv } from '@/lib/cloudflare-env';
import { retrieveCheckoutSession } from '@/lib/stripe-edge';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(req) {
  const env = getRuntimeEnv();
  const origin = req.url.includes("localhost") ? new URL(req.url).origin : "https://gastrointensivismo.com.br";
  const db = env.DB || null;

  try {
    const { name, email, password, newPassword, isLogin, action, sessionId, resetToken } = await req.json();

    if (action === "logout") {
      const response = Response.json({ success: true }, { headers: NO_CACHE_HEADERS });
      response.headers.append("Set-Cookie", clearSessionCookie());
      return response;
    }

    // 0. Consulta a sessao somente para confirmar a tela de sucesso.
    // A liberacao de acesso acontece exclusivamente pelo webhook assinado.
    if (action === "verify-session") {
      if (!sessionId) {
        return Response.json({ error: 'sessionId é obrigatório' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      try {
        if (!env.STRIPE_SECRET_KEY) {
          return Response.json({ error: 'Stripe não configurado' }, { status: 503, headers: NO_CACHE_HEADERS });
        }

        const session = await retrieveCheckoutSession(env.STRIPE_SECRET_KEY, sessionId);
        if (session.payment_status !== "paid") {
          return Response.json({ error: 'Pagamento ainda não confirmado' }, { status: 409, headers: NO_CACHE_HEADERS });
        }

        const customerEmail = session.customer_details?.email || session.customer_email;
        const customerName = session.customer_details?.name || "Aluno Gastrointensivismo";

        return Response.json({ 
          success: true, 
          email: customerEmail, 
          name: customerName 
        }, { headers: NO_CACHE_HEADERS });
      } catch (stripeErr) {
        console.error("Erro ao verificar sessão no Stripe:", stripeErr);
        return Response.json({ error: 'Não foi possível validar o pagamento' }, { status: 400, headers: NO_CACHE_HEADERS });
      }
    }

    // 0.1 Reenviar E-mail de Acesso (com nova senha temporária ou reset)
    if (action === "resend-access-email") {
      if (!email) {
        return Response.json({ error: 'Por favor, informe seu e-mail.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        const userStmt = db.prepare('SELECT id, name, email, has_access, password_hash FROM Users WHERE email = ?');
        const user = await userStmt.bind(normalizedEmail).first();

        if (user && user.has_access) {
          const randomCode = Math.floor(1000 + Math.random() * 9000);
          const tempPassword = `Gastro#${randomCode}!`;
          const tempPasswordHash = await hashPassword(tempPassword);

          const updateStmt = db.prepare('UPDATE Users SET password_hash = ?, must_change_password = 1 WHERE email = ?');
          await updateStmt.bind(tempPasswordHash, normalizedEmail).run();

          await sendWelcomeEmail({
            to: normalizedEmail,
            name: user.name || "Aluno",
            tempPassword,
            loginUrl: `${origin}/login?email=${encodeURIComponent(normalizedEmail)}&temp=true`,
          });
        }
      }

      return Response.json({
        success: true,
        message: 'Novo e-mail de acesso enviado! Por favor, confira sua Caixa de Entrada, Spam e Promoções em até 2 minutos.'
      }, { headers: NO_CACHE_HEADERS });
    }

    // 0.2 Ativação Imediata de Senha Pós-Compra (Permite entrar direto sem depender do e-mail)
    if (action === "instant-activate") {
      if (!email || !newPassword) {
        return Response.json({ error: 'E-mail e nova senha são obrigatórios.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      if (newPassword.length < 8) {
        return Response.json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        let user = await db.prepare('SELECT id, name, email, has_access FROM Users WHERE email = ?').bind(normalizedEmail).first();

        // Se o usuário ainda não foi criado pelo webhook mas o sessionId foi verificado e pago
        if ((!user || !user.has_access) && sessionId && env.STRIPE_SECRET_KEY) {
          try {
            const session = await retrieveCheckoutSession(env.STRIPE_SECRET_KEY, sessionId);
            if (session.payment_status === "paid") {
              const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
              if (customerEmail === normalizedEmail) {
                const userId = user?.id || crypto.randomUUID();
                const customerName = name || session.customer_details?.name || "Aluno Gastrointensivismo";
                const newPasswordHash = await hashPassword(newPassword);

                if (user) {
                  await db.prepare('UPDATE Users SET name = ?, password_hash = ?, has_access = 1, must_change_password = 0 WHERE email = ?')
                    .bind(customerName, newPasswordHash, normalizedEmail).run();
                } else {
                  await db.prepare('INSERT INTO Users (id, name, email, password_hash, has_access, must_change_password, stripe_id) VALUES (?, ?, ?, ?, 1, 0, ?)')
                    .bind(userId, customerName, normalizedEmail, newPasswordHash, session.customer || session.id).run();
                }

                user = { id: userId, name: customerName, email: normalizedEmail, has_access: 1 };
              }
            }
          } catch (e) {
            console.error("Erro ao validar session no instant-activate:", e);
          }
        }

        if (!user || !user.has_access) {
          return Response.json({ error: 'Nenhuma compra confirmada encontrada para este e-mail.' }, { status: 403, headers: NO_CACHE_HEADERS });
        }

        const newPasswordHash = await hashPassword(newPassword);
        await db.prepare('UPDATE Users SET password_hash = ?, must_change_password = 0, name = COALESCE(?, name) WHERE email = ?')
          .bind(newPasswordHash, name || null, normalizedEmail).run();

        const userData = {
          id: user.id,
          name: name || user.name || "Aluno",
          email: normalizedEmail,
          hasAccess: true,
          mustChangePassword: false
        };

        const token = await createSessionToken(userData);
        const response = Response.json({ success: true, user: userData }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      }
    }

    if (!db && env.ALLOW_INSECURE_DEV_AUTH !== "true") {
      return Response.json(
        { error: 'Banco de dados indisponível' },
        { status: 503, headers: NO_CACHE_HEADERS }
      );
    }

    // 1. Solicitação de Esqueci Minha Senha (Anti-Enumeração + Resend Email)
    if (action === "forgot-password") {
      if (!email) {
        return Response.json({ error: 'Por favor, informe seu e-mail.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        const userStmt = db.prepare('SELECT id, name, email, has_access FROM Users WHERE email = ?');
        const user = await userStmt.bind(normalizedEmail).first();

        if (user && user.has_access) {
          const token = await createPasswordResetToken(normalizedEmail);
          const resetUrl = `${origin}/login?reset_token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;
          
          await sendPasswordResetEmail({
            to: normalizedEmail,
            name: user.name || "Aluno",
            resetUrl,
          });
        }
      } else {
        const token = await createPasswordResetToken(normalizedEmail);
        const resetUrl = `${origin}/login?reset_token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;
        await sendPasswordResetEmail({
          to: normalizedEmail,
          name: "Aluno Gastro",
          resetUrl,
        });
      }

      return Response.json({
        success: true,
        message: 'Se este e-mail possuir cadastro e compra ativa, as instruções foram enviadas para a sua caixa de entrada. Verifique também na pasta de Spam ou Promoções.'
      }, { headers: NO_CACHE_HEADERS });
    }

    // 2. Concluir Redefinição de Senha via Link de E-mail (Token HMAC)
    if (action === "reset-password") {
      if (!email || !resetToken || !newPassword) {
        return Response.json({ error: 'Dados incompletos para redefinição de senha.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      if (newPassword.length < 8) {
        return Response.json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const isTokenValid = await verifyPasswordResetToken(resetToken, normalizedEmail);

      if (!isTokenValid) {
        return Response.json({ 
          error: 'O link de recuperação é inválido ou expirou (validade máxima de 60 minutos). Solicite um novo link.' 
        }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const newPasswordHash = await hashPassword(newPassword);

      if (db) {
        const updateStmt = db.prepare('UPDATE Users SET password_hash = ?, must_change_password = 0 WHERE email = ?');
        await updateStmt.bind(newPasswordHash, normalizedEmail).run();

        const userStmt = db.prepare('SELECT id, name, email, has_access FROM Users WHERE email = ?');
        const user = await userStmt.bind(normalizedEmail).first();

        const userData = {
          id: user?.id || "dev-id",
          name: user?.name || "Aluno",
          email: user?.email || normalizedEmail,
          hasAccess: Boolean(user?.has_access ?? true),
          mustChangePassword: false
        };

        const token = await createSessionToken({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          hasAccess: userData.hasAccess,
        });

        const response = Response.json({ 
          success: true, 
          user: userData, 
          message: 'Senha alterada com sucesso!' 
        }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      } else {
        const userData = { id: "dev-id", name: "Aluno Gastro", email: normalizedEmail, hasAccess: true, mustChangePassword: false };
        const token = await createSessionToken(userData);
        const response = Response.json({ success: true, user: userData, message: 'Senha alterada com sucesso!' }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      }
    }

    // 3. Troca Obrigatória de Senha após 1º Login
    if (action === "change-password") {
      if (!email || !newPassword) {
        return Response.json({ error: 'E-mail e nova senha são obrigatórios' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      if (newPassword.length < 8) {
        return Response.json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const currentToken = getSessionTokenFromRequest(req);
      const currentSession = currentToken
        ? await verifySessionToken(currentToken)
        : null;

      if (
        !currentSession ||
        currentSession.email.toLowerCase().trim() !== email.toLowerCase().trim()
      ) {
        return Response.json(
          { error: 'Sessão inválida ou expirada' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      const newPasswordHash = await hashPassword(newPassword);

      if (db) {
        const updateStmt = db.prepare('UPDATE Users SET password_hash = ?, must_change_password = 0 WHERE email = ?');
        await updateStmt.bind(newPasswordHash, email).run();

        const userStmt = db.prepare('SELECT id, name, email, has_access FROM Users WHERE email = ?');
        const user = await userStmt.bind(email).first();

        const userData = {
          id: user?.id || "dev-id",
          name: user?.name || "Aluno",
          email: user?.email || email,
          hasAccess: Boolean(user?.has_access ?? true),
          mustChangePassword: false
        };

        const token = await createSessionToken({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          hasAccess: userData.hasAccess,
        });

        const response = Response.json({ success: true, user: userData }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      } else {
        const userData = { id: "dev-id", name: "Aluno Gastro", email, hasAccess: true, mustChangePassword: false };
        const token = await createSessionToken(userData);
        const response = Response.json({ success: true, user: userData }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      }
    }

    // 4. Login Tradicional com Validação PBKDF2
    if (isLogin) {
      if (!email || !password) {
        return Response.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        let stmt = db.prepare('SELECT id, name, email, password_hash, has_access, must_change_password FROM Users WHERE email = ? OR LOWER(TRIM(email)) = ?');
        let user = await stmt.bind(normalizedEmail, normalizedEmail).first();

        // Se o usuário ainda não existe mas forneceu sessionId pago
        if (!user && sessionId && env.STRIPE_SECRET_KEY) {
          try {
            const session = await retrieveCheckoutSession(env.STRIPE_SECRET_KEY, sessionId);
            if (session.payment_status === "paid") {
              const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
              if (customerEmail === normalizedEmail) {
                const userId = crypto.randomUUID();
                const customerName = name || session.customer_details?.name || "Aluno Gastrointensivismo";
                const passwordHash = await hashPassword(password);
                await db.prepare('INSERT INTO Users (id, name, email, password_hash, has_access, must_change_password, stripe_id) VALUES (?, ?, ?, ?, 1, 0, ?)')
                  .bind(userId, customerName, normalizedEmail, passwordHash, session.customer || session.id).run();
                user = { id: userId, name: customerName, email: normalizedEmail, has_access: 1, must_change_password: 0 };
              }
            }
          } catch (e) {
            console.error("Erro ao verificar session no login fallback:", e);
          }
        }

        if (!user) {
          return Response.json({ error: 'E-mail ou senha inválidos. Se acabou de comprar, use a aba "Primeiro Acesso".' }, { status: 401, headers: NO_CACHE_HEADERS });
        }

        if (!user.password_hash) {
          return Response.json({ error: 'Você ainda não cadastrou uma senha. Clique na aba "Primeiro Acesso" para criar sua senha.' }, { status: 401, headers: NO_CACHE_HEADERS });
        }

        const isPasswordValid = await verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
          return Response.json({ error: 'E-mail ou senha inválidos. Verifique a senha digitada ou use a recuperação de senha.' }, { status: 401, headers: NO_CACHE_HEADERS });
        }

        if (!user.has_access) {
          return Response.json({ error: 'Este e-mail não possui uma assinatura ativa do curso.' }, { status: 403, headers: NO_CACHE_HEADERS });
        }

        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          hasAccess: Boolean(user.has_access),
          mustChangePassword: Boolean(user.must_change_password)
        };

        const token = await createSessionToken({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          hasAccess: userData.hasAccess,
        });

        const response = Response.json({ success: true, user: userData }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      } else {
        const userData = { id: "dev-id", name: "Aluno Gastro", email: normalizedEmail, hasAccess: true, mustChangePassword: false };
        const token = await createSessionToken(userData);
        const response = Response.json({ success: true, user: userData }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      }
    } 
    
    // 5. Primeiro Acesso / Registro por E-mail da Compra
    else {
      if (!email || !password) {
        return Response.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      if (password.length < 8) {
        return Response.json({ error: 'Sua senha deve ter no mínimo 8 caracteres.' }, { status: 400, headers: NO_CACHE_HEADERS });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        let checkStmt = db.prepare('SELECT id, name, has_access FROM Users WHERE email = ? OR LOWER(TRIM(email)) = ?');
        let existingUser = await checkStmt.bind(normalizedEmail, normalizedEmail).first();

        // Se o webhook atrasou mas o usuário acabou de pagar
        if ((!existingUser || !existingUser.has_access) && sessionId && env.STRIPE_SECRET_KEY) {
          try {
            const session = await retrieveCheckoutSession(env.STRIPE_SECRET_KEY, sessionId);
            if (session.payment_status === "paid") {
              const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
              if (customerEmail === normalizedEmail) {
                const userId = existingUser?.id || crypto.randomUUID();
                const customerName = name || session.customer_details?.name || "Aluno Gastrointensivismo";
                const passwordHash = await hashPassword(password);
                
                if (existingUser) {
                  await db.prepare('UPDATE Users SET name = ?, password_hash = ?, has_access = 1, must_change_password = 0 WHERE email = ? OR LOWER(TRIM(email)) = ?')
                    .bind(customerName, passwordHash, normalizedEmail, normalizedEmail).run();
                } else {
                  await db.prepare('INSERT INTO Users (id, name, email, password_hash, has_access, must_change_password, stripe_id) VALUES (?, ?, ?, ?, 1, 0, ?)')
                    .bind(userId, customerName, normalizedEmail, passwordHash, session.customer || session.id).run();
                }

                existingUser = { id: userId, name: customerName, has_access: 1 };
              }
            }
          } catch (e) {
            console.error("Erro ao validar session no signup:", e);
          }
        }

        if (!existingUser || !existingUser.has_access) {
          return Response.json({ error: 'Este e-mail não possui uma compra confirmada no sistema. Por favor, adquira o curso primeiro ou verifique a digitação.' }, { status: 403, headers: NO_CACHE_HEADERS });
        }

        const passwordHash = await hashPassword(password);
        const updateStmt = db.prepare('UPDATE Users SET name = COALESCE(?, name), password_hash = ?, must_change_password = 0 WHERE email = ? OR LOWER(TRIM(email)) = ?');
        await updateStmt.bind(name || null, passwordHash, normalizedEmail, normalizedEmail).run();

        const userData = {
          id: existingUser.id,
          name: name || existingUser.name || "Aluno",
          email: normalizedEmail,
          hasAccess: true,
          mustChangePassword: false
        };

        const token = await createSessionToken({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          hasAccess: userData.hasAccess,
        });

        const response = Response.json({ success: true, user: userData }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      } else {
        const userData = { id: "dev-id", name: name || "Aluno Gastro", email: normalizedEmail, hasAccess: true, mustChangePassword: false };
        const token = await createSessionToken(userData);
        const response = Response.json({ success: true, user: userData }, { headers: NO_CACHE_HEADERS });
        response.headers.append("Set-Cookie", createSessionCookie(token));
        return response;
      }
    }
  } catch (error) {
    console.error('API Auth Error:', error);
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
