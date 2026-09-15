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
const SUPPORT_REPLY_TO = "gastrointensiva@gmail.com";

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

Duvidas? gastrointensiva@gmail.com / WhatsApp (34) 9978-2878
Equipe Gastrointensivismo | MedCof`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Liberado - Gastrointensivismo 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#F2EEEC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1C1C;">
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
                    <strong>Dica:</strong> Adicione <strong>gastro@gastrointensivismo.com.br</strong> aos seus contatos para nao perder nenhum comunicado.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RODAPE -->
          <tr>
            <td style="background-color:#2A1F1E;border-radius:0 0 16px 16px;padding:22px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:rgba(255,255,255,0.55);">
                Duvidas? <a href="mailto:gastrointensiva@gmail.com" style="color:rgba(255,255,255,0.80);text-decoration:none;font-weight:600;">gastrointensiva@gmail.com</a> &nbsp;|&nbsp; WhatsApp <strong style="color:rgba(255,255,255,0.80);">(34) 9978-2878</strong>
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
        subject: "Seu acesso ao Gastrointensivismo 2026 esta liberado",
        text: textContent,
        html: htmlContent,
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
                Duvidas? <a href="mailto:gastrointensiva@gmail.com" style="color:rgba(255,255,255,0.80);text-decoration:none;font-weight:600;">gastrointensiva@gmail.com</a> &nbsp;|&nbsp; WhatsApp <strong style="color:rgba(255,255,255,0.80);">(34) 9978-2878</strong>
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
