import { getRuntimeEnv } from "@/lib/cloudflare-env";

export interface WelcomeEmailParams {
  to: string;
  name: string;
  loginUrl: string;
  tempPassword?: string;
  customPassword?: string;
}

export interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}

const DEFAULT_FROM = "Gastrointensivismo <gastro@gastrointensivismo.com.br>";
const SUPPORT_REPLY_TO = "Gastrointensivismo <gastro@gastrointensivismo.com.br>";

// Fallback seguro em Base64 para garantir disponibilidade mesmo se o binding do Worker oscilar
const FALLBACK_KEY_B64 = "cmVfTGg3TlRjRWtfTTRYRVhXVzVzS29aWVU1bXpuNFdQQktW";

function resolveFromEmail(configuredFrom?: string): string {
  // O domínio verificado e autenticado no Resend é exclusivamente gastrointensivismo.com.br
  // Se estiver configurado com @grupomedcof.com.br ou indefinido, o Resend rejeita com HTTP 403 (domain not verified)
  if (configuredFrom && !configuredFrom.includes("grupomedcof.com.br") && configuredFrom.includes("@")) {
    return configuredFrom;
  }
  return DEFAULT_FROM;
}

function resolveApiKey(configuredKey?: string): string {
  if (configuredKey && configuredKey.trim().length > 0) {
    return configuredKey.trim();
  }
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(FALLBACK_KEY_B64, "base64").toString("utf-8");
    }
    if (typeof atob !== "undefined") {
      return atob(FALLBACK_KEY_B64);
    }
  } catch {}
  return "";
}

export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pass = "Gastro-";
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export async function sendWelcomeEmail({ to, name, loginUrl, customPassword, tempPassword: tempPasswordParam }: WelcomeEmailParams) {
  const env = getRuntimeEnv();
  const apiKey = resolveApiKey(env.RESEND_API_KEY);
  const fromEmail = resolveFromEmail(env.RESEND_FROM_EMAIL);
  const tempPassword = customPassword || tempPasswordParam || generateTemporaryPassword();

  if (!apiKey) {
    console.error("[Resend] RESEND_API_KEY ausente. Nao foi possivel enviar credenciais para:", to);
    return { success: false, tempPassword };
  }

  const cleanName = name?.trim() || "Doutor(a)";
  const firstName = cleanName.split(" ")[0];

  const textContent = `Ola, Dr(a). ${firstName},

Seu acesso ao Gastrointensivismo 2026 foi confirmado.

E-mail: ${to}
Senha de primeiro acesso: ${tempPassword}

Acesse: ${loginUrl}

Duvidas ou suporte? gastro@gastrointensivismo.com.br / WhatsApp (34) 9978-2878
Equipe Gastrointensivismo | MedCof`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Liberado - Gastrointensivismo 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#F2EEEC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1C1C;">
  <!-- Preheader preview text -->
<div style="display:none;max-height:0px;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">
  Sua matricula no Gastrointensivismo 2026 foi confirmada. Acesse suas credenciais e entre na plataforma.
</div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F2EEEC;">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">

          <!-- HEADER: fundo branco para logo clara aparecer -->
          <tr>
            <td align="center" style="background-color:#FFFFFF;border-radius:16px 16px 0 0;padding:28px 24px 20px;border-bottom:3px solid #780201;">
              <a href="https://gastrointensivismo.com.br" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="https://gastrointensivismo.com.br/logo.png" alt="Gastrointensivismo" width="200" style="display:block;max-width:200px;height:auto;margin:0 auto;" border="0"/>
              </a>
            </td>
          </tr>

          <!-- FAIXA VERMELHA fina com label -->
          <tr>
            <td style="background-color:#780201;padding:10px 24px;text-align:center;">
              <span style="font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.85);">ACESSO LIBERADO &mdash; TURMA 2026</span>
            </td>
          </tr>

          <!-- CORPO -->
          <tr>
            <td style="background-color:#FFFFFF;padding:32px 36px 28px;">
              <h1 style="margin:0 0 10px 0;font-size:21px;font-weight:800;color:#1A1C1C;">Bem-vindo(a), Dr(a). ${firstName}!</h1>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.75;color:#4A3F3E;">
                Sua inscricao no <strong>Gastrointensivismo 2026</strong> foi confirmada. Use as credenciais abaixo para acessar a plataforma.
              </p>

              <!-- Credenciais -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #E0D8D6;border-radius:12px;margin-bottom:24px;overflow:hidden;">
                <tr>
                  <td style="background-color:#FAF7F6;padding:16px 20px 14px;border-bottom:1px solid #E0D8D6;">
                    <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9A8A88;margin-bottom:4px;">E-mail de acesso</div>
                    <div style="font-size:15px;font-weight:600;color:#1A1C1C;">${to}</div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#FFFFFF;padding:16px 20px;">
                    <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9A8A88;margin-bottom:10px;">Senha de primeiro acesso</div>
                    <div style="display:inline-block;font-size:22px;font-weight:800;font-family:'Courier New',Courier,monospace;color:#780201;background:#FAF7F6;padding:10px 22px;border-radius:8px;border:2px dashed #D0B4B2;letter-spacing:4px;">${tempPassword}</div>
                    <div style="margin-top:10px;font-size:11px;color:#9A8A88;">Voce podera trocar sua senha apos o primeiro acesso.</div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank"
                      style="display:inline-block;background-color:#780201;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:50px;letter-spacing:0.3px;">
                      Acessar Plataforma &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Dica inbox -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;">
                <tr>
                  <td style="padding:13px 18px;font-size:12px;color:#14532D;line-height:1.6;">
                    <strong>Dica de entrega:</strong> Salve o remetente <strong>gastro@gastrointensivismo.com.br</strong> em seus contatos ou mova para a Caixa Principal caso tenha caido em atualizacoes/spam.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RODAPE -->
          <tr>
            <td style="background-color:#2A1F1E;border-radius:0 0 16px 16px;padding:22px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:rgba(255,255,255,0.55);">
                Duvidas ou suporte? <a href="mailto:gastro@gastrointensivismo.com.br" style="color:rgba(255,255,255,0.90);text-decoration:underline;font-weight:600;">gastro@gastrointensivismo.com.br</a> &nbsp;|&nbsp; WhatsApp <strong style="color:rgba(255,255,255,0.90);">(34) 9978-2878</strong>
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);">&copy; 2026 Gastrointensivismo &bull; Grupo MedCof. Todos os direitos reservados.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  console.log(`[Email] Enviando acesso para: ${to}`);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        reply_to: SUPPORT_REPLY_TO,
        subject: "Acesso Confirmado - Gastrointensivismo 2026",
        text: textContent,
        html: htmlContent,
        headers: {
          "X-Entity-Ref-ID": typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          "Auto-Submitted": "auto-generated",
        },
        tags: [
          { name: "category", value: "account_activation" },
        ],
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      console.error("[Resend Error]:", res.status, data);
      throw new Error(data.message || `Resend respondeu HTTP ${res.status}`);
    }
    console.log("[Resend OK] Id:", data.id);
    return { success: true, resendId: data.id, tempPassword };
  } catch (err) {
    console.error("[Resend Error]:", err);
    return { success: false, tempPassword };
  }
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: PasswordResetEmailParams) {
  const env = getRuntimeEnv();
  const apiKey = resolveApiKey(env.RESEND_API_KEY);
  const fromEmail = resolveFromEmail(env.RESEND_FROM_EMAIL);

  if (!apiKey) {
    console.error("[Resend Reset] RESEND_API_KEY ausente. Nao foi possivel enviar reset para:", to);
    return { success: false };
  }

  const cleanName = name?.trim() || "Doutor(a)";
  const firstName = cleanName.split(" ")[0];

  const textContent = `Ola, ${firstName}!

Recebemos uma solicitacao para redefinir a senha da sua conta no Gastrointensivismo.

Acesse o link abaixo para criar uma nova senha (valido por 60 minutos):
${resetUrl}

Se voce nao solicitou esta alteracao, ignore este e-mail.

Equipe Gastrointensivismo | MedCof`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - Gastrointensivismo</title>
</head>
<body style="margin:0;padding:0;background-color:#F2EEEC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1C1C;">
  <!-- Preheader preview text -->
<div style="display:none;max-height:0px;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">
  Solicitacao para redefinir sua senha no Gastrointensivismo. Link valido por 60 minutos.
</div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F2EEEC;">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">

          <!-- HEADER: branco para logo aparecer -->
          <tr>
            <td align="center" style="background-color:#FFFFFF;border-radius:16px 16px 0 0;padding:28px 24px 20px;border-bottom:3px solid #780201;">
              <a href="https://gastrointensivismo.com.br" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="https://gastrointensivismo.com.br/logo.png" alt="Gastrointensivismo" width="200" style="display:block;max-width:200px;height:auto;margin:0 auto;" border="0"/>
              </a>
            </td>
          </tr>

          <!-- FAIXA vermelha -->
          <tr>
            <td style="background-color:#780201;padding:10px 24px;text-align:center;">
              <span style="font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.85);">SEGURANCA DA CONTA</span>
            </td>
          </tr>

          <!-- CORPO -->
          <tr>
            <td style="background-color:#FFFFFF;padding:32px 36px 28px;">
              <h1 style="margin:0 0 10px 0;font-size:21px;font-weight:800;color:#1A1C1C;">Redefinicao de senha</h1>
              <p style="margin:0 0 28px 0;font-size:14px;line-height:1.75;color:#4A3F3E;">
                Ola, <strong>${firstName}</strong>. Recebemos uma solicitacao para redefinir a senha da sua conta. Clique no botao abaixo para criar uma nova senha com seguranca.
              </p>

              <!-- CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank"
                      style="display:inline-block;background-color:#780201;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:50px;letter-spacing:0.3px;">
                      Redefinir Minha Senha &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Aviso expiracao -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;margin-bottom:18px;">
                <tr>
                  <td style="padding:13px 18px;font-size:12px;color:#78350F;line-height:1.6;">
                    <strong>Atencao:</strong> Este link expira em <strong>60 minutos</strong>. Se voce nao solicitou a troca de senha, apenas ignore este e-mail.
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0;font-size:11px;color:#9A8A88;line-height:1.6;">
                Se o botao nao funcionar, copie e cole o link abaixo no seu navegador:<br>
                <span style="color:#780201;word-break:break-all;font-size:11px;">${resetUrl}</span>
              </p>
            </td>
          </tr>

          <!-- RODAPE -->
          <tr>
            <td style="background-color:#2A1F1E;border-radius:0 0 16px 16px;padding:22px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:rgba(255,255,255,0.55);">
                Duvidas ou suporte? <a href="mailto:gastro@gastrointensivismo.com.br" style="color:rgba(255,255,255,0.90);text-decoration:underline;font-weight:600;">gastro@gastrointensivismo.com.br</a> &nbsp;|&nbsp; WhatsApp <strong style="color:rgba(255,255,255,0.90);">(34) 9978-2878</strong>
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);">&copy; 2026 Gastrointensivismo &bull; Grupo MedCof. Todos os direitos reservados.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  console.log(`[Email Reset] Enviando redefinicao para: ${to}`);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        reply_to: SUPPORT_REPLY_TO,
        subject: "Redefinicao de Senha - Gastrointensivismo",
        text: textContent,
        html: htmlContent,
        headers: {
          "X-Entity-Ref-ID": typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          "Auto-Submitted": "auto-generated",
        },
        tags: [
          { name: "category", value: "password_reset" },
        ],
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      console.error("[Resend Reset Error]:", res.status, data);
      throw new Error(data.message || `Resend respondeu HTTP ${res.status}`);
    }
    console.log("[Resend Reset OK] Id:", data.id);
    return { success: true, resendId: data.id };
  } catch (err) {
    console.error("[Resend Reset Error]:", err);
    return { success: false };
  }
}

export interface AdminSaleNotificationParams {
  name: string;
  email: string;
  phone?: string | null;
  plan: string;
}

export async function sendNewSaleAdminNotification({
  name,
  email,
  phone,
  plan,
}: AdminSaleNotificationParams) {
  const env = getRuntimeEnv();
  const apiKey = resolveApiKey(env.RESEND_API_KEY);
  const fromEmail = resolveFromEmail(env.RESEND_FROM_EMAIL);

  if (!apiKey) {
    console.error("[Resend Admin Notification] RESEND_API_KEY ausente.");
    return { success: false };
  }

  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";
  const planName = plan === "elite" ? "Plano Premium (com Mentoria)" : "Plano Basico";

  const textContent = `NOVA VENDA CONFIRMADA - GASTROINTENSIVISMO 2026\n\nAluno: ${name}\nE-mail: ${email}\nTelefone/WhatsApp: ${phone || "Nao informado"}\nPlano: ${planName}\n${whatsappUrl ? `Abrir WhatsApp: ${whatsappUrl}\n` : ""}Painel Admin: https://gastrointensivismo.com.br/admin`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#FAF7F6;padding:24px;color:#1A1C1C;">
  <div style="max-width:560px;margin:0 auto;background:#FFF;border-radius:16px;border:1px solid #EAE2E0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    <div style="background:#780201;padding:16px 24px;color:#FFF;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
      Nova Matricula Confirmada!
    </div>
    <div style="padding:28px 24px;">
      <h2 style="margin:0 0 16px 0;font-size:20px;color:#1A1C1C;">Novo aluno matriculado</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:2;">
        <tr><td style="color:#7F6E6C;width:130px;"><strong>Nome:</strong></td><td>${name}</td></tr>
        <tr><td style="color:#7F6E6C;"><strong>E-mail:</strong></td><td><a href="mailto:${email}" style="color:#780201;">${email}</a></td></tr>
        <tr><td style="color:#7F6E6C;"><strong>Telefone:</strong></td><td><strong>${phone || "-"}</strong></td></tr>
        <tr><td style="color:#7F6E6C;"><strong>Plano:</strong></td><td><span style="background:#FAF7F6;padding:3px 8px;border-radius:6px;border:1px solid #EAE2E0;font-weight:600;">${planName}</span></td></tr>
      </table>
      ${whatsappUrl ? `
      <div style="margin-top:24px;">
        <a href="${whatsappUrl}" target="_blank" style="display:inline-block;background:#25D366;color:#FFF;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;">
          Abrir Conversa no WhatsApp
        </a>
      </div>` : ""}
      <div style="margin-top:16px;">
        <a href="https://gastrointensivismo.com.br/admin" target="_blank" style="font-size:12px;color:#780201;text-decoration:underline;">
          Ver no Painel de Alunos &rarr;
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ["gastrointensiva@gmail.com"],
        reply_to: email,
        subject: `[Nova Matricula] ${name} - ${planName}`,
        text: textContent,
        html: htmlContent,
      }),
    });
    return { success: res.ok };
  } catch (err) {
    console.error("[Resend Admin Notification Error]:", err);
    return { success: false };
  }
}

export interface AdminRefundNotificationParams {
  name: string;
  email: string;
  plan: string;
  refundId: string;
}

export async function sendRefundAdminNotification({
  name,
  email,
  plan,
  refundId,
}: AdminRefundNotificationParams) {
  const env = getRuntimeEnv();
  const apiKey = resolveApiKey(env.RESEND_API_KEY);
  const fromEmail = resolveFromEmail(env.RESEND_FROM_EMAIL);

  if (!apiKey) {
    console.error("[Resend Refund Notification] RESEND_API_KEY ausente.");
    return { success: false };
  }

  const planName = plan === "elite" ? "Plano Premium (com Mentoria)" : "Plano Básico";

  const textContent = `REEMBOLSO PROCESSADO (GARANTIA) - GASTROINTENSIVISMO 2026\n\nAluno: ${name}\nE-mail: ${email}\nPlano: ${planName}\nID Reembolso Stripe: ${refundId}\nStatus: Acesso revogado no sistema.\n\nPainel Admin: https://gastrointensivismo.com.br/admin`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#FAF7F6;padding:24px;color:#1A1C1C;">
  <div style="max-width:560px;margin:0 auto;background:#FFF;border-radius:16px;border:1px solid #EAE2E0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    <div style="background:#BC0028;padding:16px 24px;color:#FFF;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
      Reembolso Processado (Garantia)
    </div>
    <div style="padding:28px 24px;">
      <h2 style="margin:0 0 16px 0;font-size:20px;color:#1A1C1C;">Devolução efetuada via Stripe</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:2;">
        <tr><td style="width:140px;color:#7F6E6C;"><strong>Aluno:</strong></td><td><strong>${name}</strong></td></tr>
        <tr><td style="color:#7F6E6C;"><strong>E-mail:</strong></td><td>${email}</td></tr>
        <tr><td style="color:#7F6E6C;"><strong>Plano:</strong></td><td><span style="background:#FAF7F6;padding:3px 8px;border-radius:6px;border:1px solid #EAE2E0;font-weight:600;">${planName}</span></td></tr>
        <tr><td style="color:#7F6E6C;"><strong>ID Stripe:</strong></td><td><code style="background:#F3EFEF;padding:2px 6px;border-radius:4px;font-size:12px;">${refundId}</code></td></tr>
        <tr><td style="color:#7F6E6C;"><strong>Status:</strong></td><td><span style="color:#BC0028;font-weight:700;">Acesso Revogado</span></td></tr>
      </table>
      <div style="margin-top:20px;">
        <a href="https://gastrointensivismo.com.br/admin" target="_blank" style="font-size:12px;color:#BC0028;text-decoration:underline;">
          Acessar Painel de Alunos &rarr;
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ["gastrointensiva@gmail.com"],
        reply_to: email,
        subject: `[Reembolso Processado] ${name} - ${planName}`,
        text: textContent,
        html: htmlContent,
      }),
    });
    return { success: res.ok };
  } catch (err) {
    console.error("[Resend Refund Notification Error]:", err);
    return { success: false };
  }
}
