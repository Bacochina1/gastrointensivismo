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
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "Gastrointensivismo <gastro@grupomedcof.com.br>";
  const tempPassword = customPassword || tempPasswordParam || generateTemporaryPassword();
  const baseUrl = loginUrl.split('/login')[0] || "https://gastro.papodecirurgiao.workers.dev";

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY nao configurada. Pulando envio.");
    return { success: false, tempPassword };
  }

  const cleanName = name?.trim() || "Doutor(a)";
  const firstName = cleanName.split(" ")[0];

  // Plain-text version essencial para passar em filtros anti-spam (SPF/DKIM/DMARC)
  const textContent = `Ola, ${firstName}!

Seu acesso ao treinamento Gastrointensivismo (Treinamento Oficial 2026) foi liberado com sucesso.

Abaixo estao suas credenciais de primeiro acesso:
E-mail: ${to}
Senha temporaria: ${tempPassword}

Acesse sua conta pelo link abaixo:
${loginUrl}

No seu primeiro acesso, voce podera cadastrar sua senha definitiva com total seguranca.

Caso precise de qualquer suporte com seu acesso, basta responder diretamente a esta mensagem.

Atenciosamente,
Equipe Gastrointensivismo | Powered by MedCof
contato@grupomedcof.com.br
`;

  // HTML com estrutura de tabela tradicional (compatibilidade 100% com Gmail, Outlook e Apple Mail)
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Acesso Liberado - Gastrointensivismo</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" class="email-container">
          
          <!-- Header Limpo Transacional -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; background-color: #1E293B; border-bottom: 3px solid #BA1A1A;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      GASTRO<span style="color: #EF4444;">INTENSIVISMO</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 6px;">
                    <span style="color: #94A3B8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                      Treinamento Oficial 2026 &bull; Powered by MedCof
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo Principal do E-mail -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;" class="content-padding">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                Ola, ${firstName}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Seu acesso a plataforma exclusiva do treinamento <strong>Gastrointensivismo</strong> esta confirmado e liberado. Abaixo estao as credenciais para o seu primeiro login:
              </p>

              <!-- Caixa de Credenciais Segura -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748B;">E-mail Cadastrado</span>
                          <div style="font-size: 15px; font-weight: 600; color: #0F172A; margin-top: 2px;">${to}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #E2E8F0; padding-top: 12px;">
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748B;">Senha de Primeiro Acesso</span>
                          <div style="font-size: 17px; font-weight: 700; font-family: monospace; color: #BA1A1A; margin-top: 4px; background: #FFFFFF; padding: 6px 12px; border-radius: 6px; border: 1px dashed #CBD5E1; display: inline-block;">
                            ${tempPassword}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botão Principal de Acesso -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: block; width: 100%; max-width: 320px; background-color: #BA1A1A; color: #FFFFFF; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 16px 24px; border-radius: 50px; box-shadow: 0 4px 10px rgba(186, 26, 26, 0.25);">
                      Acessar Area do Aluno &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Aviso de Segurança -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; margin-bottom: 12px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #92400E; line-height: 1.5;">
                    <strong>Seguranca do Aluno:</strong> No seu primeiro acesso, o sistema solicitara a criacao da sua senha definitiva e pessoal.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé Transacional -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                Precisa de suporte com seu acesso? Responda diretamente a este e-mail.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                &copy; 2026 Gastrointensivismo &bull; Grupo MedCof. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  console.log(`[Email Transacional] Enviando acesso para: ${to}`);

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
        subject: "Dados de acesso ao Gastrointensivismo 2026",
        text: textContent,
        html: htmlContent,
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) {
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
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "Gastrointensivismo <gastro@grupomedcof.com.br>";

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY nao configurada.");
    return { success: false };
  }

  const cleanName = name?.trim() || "Doutor(a)";
  const firstName = cleanName.split(" ")[0];

  const textContent = `Ola, ${firstName}!

Recebemos uma solicitacao para redefinir a senha da sua conta no treinamento Gastrointensivismo.

Para cadastrar uma nova senha, acesse o link abaixo:
${resetUrl}

Este link expira em 60 minutos por motivos de seguranca. Se voce nao solicitou esta alteracao, por favor desconsidere este e-mail.

Atenciosamente,
Equipe Gastrointensivismo | MedCof
`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Redefinir Senha - Gastrointensivismo</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" class="email-container">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 28px 24px 20px 24px; background-color: #1E293B; border-bottom: 3px solid #BA1A1A;">
              <span style="color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                GASTRO<span style="color: #EF4444;">INTENSIVISMO</span>
              </span>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;" class="content-padding">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">
                Ola, ${firstName}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Recebemos uma solicitacao para redefinir a senha da sua conta de aluno. Clique no botao abaixo para criar sua nova senha com seguranca:
              </p>

              <!-- Botão -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: block; width: 100%; max-width: 300px; background-color: #BA1A1A; color: #FFFFFF; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; padding: 16px 24px; border-radius: 50px; box-shadow: 0 4px 10px rgba(186, 26, 26, 0.25);">
                      Redefinir Minha Senha &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748B; line-height: 1.5;">
                    Este link de redefinicao e valido por 60 minutos. Se voce nao solicitou esta troca, apenas ignore esta mensagem.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                &copy; 2026 Gastrointensivismo &bull; Grupo MedCof
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
        to: [to],
        subject: "Redefinicao de Senha - Gastrointensivismo",
        text: textContent,
        html: htmlContent,
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) {
      throw new Error(data.message || `Resend respondeu HTTP ${res.status}`);
    }
    return { success: true, resendId: data.id };
  } catch (err) {
    console.error("[Resend Reset Error]:", err);
    return { success: false };
  }
}
