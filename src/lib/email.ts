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

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY nao configurada. Pulando envio.");
    return { success: false, tempPassword };
  }

  const cleanName = name?.trim() || "Doutor(a)";
  const firstName = cleanName.split(" ")[0];

  // Plain-text version essencial para alta entregabilidade e filtros de caixa de entrada principal
  const textContent = `Ola, Dr(a). ${firstName},

Seu acesso ao treinamento Gastrointensivismo 2026 esta confirmado e disponivel.

Seguem suas credenciais de acesso:
E-mail: ${to}
Senha temporaria: ${tempPassword}

Acesse o portal do aluno pelo link:
${loginUrl}

Dica importante: Para receber todas as atualizacoes e comunicados diretamente na sua caixa de entrada principal, adicione este endereco aos seus contatos confiaveis ou arraste esta mensagem para a aba Principal.

Se precisar de auxilio, basta responder a este e-mail.

Atenciosamente,
Equipe Gastrointensivismo | MedCof
contato@grupomedcof.com.br
`;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso ao Gastrointensivismo 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          
          <!-- Header MedCof Gastro -->
          <tr>
            <td style="padding: 28px 32px; background-color: #780201; border-bottom: 2px solid #5C0100;">
              <span style="color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                GASTROINTENSIVISMO
              </span>
              <div style="color: #FFCDD2; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                Treinamento Oficial 2026 &bull; MedCof
              </div>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">
                Ola, Dr(a). ${firstName}!
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Sua inscricao no treinamento <strong>Gastrointensivismo</strong> foi confirmada com sucesso. Abaixo estao as credenciais para o seu primeiro acesso:
              </p>

              <!-- Caixa de Credenciais -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748B;">E-mail Cadastrado</div>
                    <div style="font-size: 15px; font-weight: 600; color: #0F172A; margin: 4px 0 16px 0;">${to}</div>
                    
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 12px;">Senha de Primeiro Acesso</div>
                    <div style="font-size: 17px; font-weight: 700; font-family: monospace; color: #780201; margin-top: 4px; background: #FFFFFF; padding: 6px 12px; border-radius: 6px; border: 1px dashed #CBD5E1; display: inline-block;">
                      ${tempPassword}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Botão Acesso -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: block; width: 100%; max-width: 320px; background-color: #780201; color: #FFFFFF; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 16px 24px; border-radius: 50px;">
                      Acessar Area do Aluno &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Dica de Caixa de Entrada / Anti-Spam -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; margin-bottom: 8px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #1E40AF; line-height: 1.5;">
                    📌 <strong>Dica de Entrega:</strong> Para receber todas as notificacoes e aulas na sua <strong>Caixa Principal</strong> do Gmail ou Outlook, arraste esta mensagem da aba <em>Promocoes / Spam</em> para a aba <em>Principal</em> e adicione este remetente aos seus contatos.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748B;">
                Duvidas ou suporte? Responda diretamente a este e-mail.
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
        subject: "Acesso Liberado: Gastrointensivismo 2026",
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
