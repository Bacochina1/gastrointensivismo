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

Seu acesso ao treinamento Gastrointensivismo 2026 esta confirmado.

Credenciais de acesso:
E-mail: ${to}
Senha de primeiro acesso: ${tempPassword}

Acesse a plataforma: ${loginUrl}

Duvidas? Escreva para gastrointensiva@gmail.com ou WhatsApp (34) 9978-2878.

Equipe Gastrointensivismo | MedCof`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Liberado - Gastrointensivismo 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1C1C;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#F5F0EF;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;">

          <!-- Header vermelho com logo -->
          <tr>
            <td align="center" style="background-color:#780201;border-radius:16px 16px 0 0;padding:28px 24px 24px 24px;">
              <a href="https://gastrointensivismo.com.br" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="https://gastrointensivismo.com.br/logo.png" alt="Gastrointensivismo" width="210" height="auto" style="display:block;max-width:210px;width:100%;height:auto;margin:0 auto;" border="0" />
              </a>
              <p style="margin:14px 0 0 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.70);">TREINAMENTO 2026</p>
            </td>
          </tr>

          <!-- Corpo branco -->
          <tr>
            <td style="background-color:#FFFFFF;padding:36px 36px 28px 36px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#1A1C1C;letter-spacing:-0.4px;">Seu acesso esta liberado, Dr(a). ${firstName}!</h1>
              <p style="margin:0 0 28px 0;font-size:15px;line-height:1.7;color:#5A4A48;">
                Sua inscricao no <strong>Gastrointensivismo 2026</strong> foi confirmada com sucesso. Use as credenciais abaixo para acessar a plataforma agora mesmo.
              </p>

              <!-- Caixa de Credenciais -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FAF7F6;border:2px solid #E5DCDB;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:0;">
                    <!-- Linha e-mail -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:18px 20px 14px 20px;border-bottom:1px solid #E5DCDB;">
                          <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9A8A88;margin-bottom:4px;">E-mail de acesso</div>
                          <div style="font-size:15px;font-weight:600;color:#1A1C1C;">${to}</div>
                        </td>
                      </tr>
                    </table>
                    <!-- Linha senha -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#9A8A88;margin-bottom:8px;">Senha de primeiro acesso</div>
                          <div style="display:inline-block;font-size:22px;font-weight:800;font-family:'Courier New',Courier,monospace;color:#780201;background:#FFFFFF;padding:10px 20px;border-radius:8px;border:2px dashed #D0B4B2;letter-spacing:3px;">${tempPassword}</div>
                          <div style="margin-top:10px;font-size:11px;color:#9A8A88;">Voce podera alterar sua senha apos o primeiro acesso.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botao CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display:inline-block;background-color:#780201;color:#FFFFFF;font-size:15px;font-weight:700;text-align:center;text-decoration:none;padding:16px 40px;border-radius:50px;letter-spacing:0.3px;">
                      Acessar Plataforma &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Dica anti-spam -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;">
                <tr>
                  <td style="padding:14px 18px;font-size:12px;color:#14532D;line-height:1.6;">
                    <strong>Dica:</strong> Para nao perder nenhum comunicado, adicione <strong>gastro@gastrointensivismo.com.br</strong> aos seus contatos e mova este e-mail para a aba <em>Principal</em>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodape -->
          <tr>
            <td style="background-color:#1A1C1C;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:rgba(255,255,255,0.6);">
                Duvidas? Responda este e-mail ou fale em <strong style="color:rgba(255,255,255,0.85);">gastrointensiva@gmail.com</strong> / WhatsApp <strong style="color:rgba(255,255,255,0.85);">(34) 9978-2878</strong>
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);">&copy; 2026 Gastrointensivismo &bull; Grupo MedCof. Todos os direitos reservados.</p>
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

Acesse o link abaixo para cadastrar sua nova senha (valido por 60 minutos):
${resetUrl}

Se voce nao solicitou esta alteracao, ignore este e-mail.

Equipe Gastrointensivismo | MedCof`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - Gastrointensivismo</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1C1C;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#F5F0EF;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#780201;border-radius:16px 16px 0 0;padding:28px 24px 24px 24px;">
              <a href="https://gastrointensivismo.com.br" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="https://gastrointensivismo.com.br/logo.png" alt="Gastrointensivismo" width="210" height="auto" style="display:block;max-width:210px;width:100%;height:auto;margin:0 auto;" border="0" />
              </a>
              <p style="margin:14px 0 0 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.70);">SEGURANCA DA CONTA</p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="background-color:#FFFFFF;padding:36px 36px 28px 36px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#1A1C1C;letter-spacing:-0.4px;">Redefinicao de senha</h1>
              <p style="margin:0 0 28px 0;font-size:15px;line-height:1.7;color:#5A4A48;">
                Ola, <strong>${firstName}</strong>. Recebemos uma solicitacao para redefinir a senha da sua conta. Clique no botao abaixo para criar uma nova senha com seguranca.
              </p>

              <!-- Botao CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display:inline-block;background-color:#780201;color:#FFFFFF;font-size:15px;font-weight:700;text-align:center;text-decoration:none;padding:16px 40px;border-radius:50px;letter-spacing:0.3px;">
                      Redefinir Minha Senha &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info expiracao -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FEF9EC;border:1px solid #FDE68A;border-radius:10px;margin-bottom:16px;">
                <tr>
                  <td style="padding:14px 18px;font-size:12px;color:#92400E;line-height:1.6;">
                    <strong>Atencao:</strong> Este link expira em <strong>60 minutos</strong>. Se voce nao solicitou a troca de senha, apenas ignore este e-mail.
                  </td>
                </tr>
              </table>

              <!-- Link texto fallback -->
              <p style="margin:0;font-size:11px;color:#9A8A88;line-height:1.5;">
                Se o botao nao funcionar, copie e cole este link no seu navegador:<br>
                <span style="color:#780201;word-break:break-all;">${resetUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Rodape -->
          <tr>
            <td style="background-color:#1A1C1C;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:rgba(255,255,255,0.6);">
                Duvidas? Fale em <strong style="color:rgba(255,255,255,0.85);">gastrointensiva@gmail.com</strong> / WhatsApp <strong style="color:rgba(255,255,255,0.85);">(34) 9978-2878</strong>
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);">&copy; 2026 Gastrointensivismo &bull; Grupo MedCof. Todos os direitos reservados.</p>
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
