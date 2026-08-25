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
<body style="margin: 0; padding: 0; background-color: #FAF7F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1C1C;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #FAF7F6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5DCDB; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          
          <!-- Header Logo PNG -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; background-color: #FFFFFF; border-bottom: 1px solid #F0EAE9;">
              <a href="https://gastrointensivismo.com.br" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://gastrointensivismo.com.br/logo.png" alt="Gastrointensivismo" width="230" style="display: block; max-width: 230px; width: 100%; height: auto; margin: 0 auto;" border="0" />
              </a>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 21px; font-weight: 700; color: #1A1C1C; letter-spacing: -0.3px;">
                Olá, Dr(a). ${firstName}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4F4645;">
                Sua inscrição no treinamento <strong>Gastrointensivismo</strong> foi confirmada com sucesso. Abaixo estão as credenciais para o seu primeiro acesso:
              </p>

              <!-- Caixa de Credenciais -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F6; border: 1px solid #E5DCDB; border-radius: 16px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 22px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7F6E6C;">E-mail Cadastrado</div>
                    <div style="font-size: 15px; font-weight: 600; color: #1A1C1C; margin: 4px 0 18px 0;">${to}</div>
                    
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7F6E6C; border-top: 1px solid #E5DCDB; padding-top: 14px;">Senha de Primeiro Acesso</div>
                    <div style="font-size: 18px; font-weight: 700; font-family: monospace; color: #780201; margin-top: 6px; background: #FFFFFF; padding: 8px 16px; border-radius: 8px; border: 1px dashed #D0C4C2; display: inline-block;">
                      ${tempPassword}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Botão Acesso -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: block; width: 100%; max-width: 320px; background-color: #780201; color: #FFFFFF; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 16px 24px; border-radius: 50px; box-shadow: 0 4px 12px rgba(120, 2, 1, 0.25);">
                      Acessar Área do Aluno &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Dica de Caixa de Entrada / Anti-Spam -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; margin-bottom: 8px;">
                <tr>
                  <td style="padding: 14px 18px; font-size: 12px; color: #166534; line-height: 1.5;">
                    📌 <strong>Dica de Entrega:</strong> Para receber todas as atualizações e aulas na sua <strong>Caixa Principal</strong> do Gmail ou Outlook, arraste esta mensagem da aba <em>Promoções / Spam</em> para a aba <em>Principal</em> e adicione este remetente aos seus contatos.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 24px 32px; background-color: #FAF7F6; border-top: 1px solid #E5DCDB; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #7F6E6C;">
                Dúvidas ou suporte pedagógico? Responda diretamente a este e-mail.
              </p>
              <p style="margin: 0; font-size: 11px; color: #9A8A88;">
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
  <title>Redefinir Senha - Gastrointensivismo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1C1C;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5DCDB; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          
          <!-- Header Logo PNG -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; background-color: #FFFFFF; border-bottom: 1px solid #F0EAE9;">
              <a href="https://gastrointensivismo.com.br" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://gastrointensivismo.com.br/logo.png" alt="Gastrointensivismo" width="230" style="display: block; max-width: 230px; width: 100%; height: auto; margin: 0 auto;" border="0" />
              </a>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 21px; font-weight: 700; color: #1A1C1C; letter-spacing: -0.3px;">
                Olá, ${firstName}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4F4645;">
                Recebemos uma solicitação para redefinir a senha da sua conta de aluno. Clique no botão abaixo para cadastrar sua nova senha com segurança:
              </p>

              <!-- Botão -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: block; width: 100%; max-width: 300px; background-color: #780201; color: #FFFFFF; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 16px 24px; border-radius: 50px; box-shadow: 0 4px 12px rgba(120, 2, 1, 0.25);">
                      Redefinir Minha Senha &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F6; border: 1px solid #E5DCDB; border-radius: 12px;">
                <tr>
                  <td style="padding: 14px 18px; font-size: 12px; color: #7F6E6C; line-height: 1.5;">
                    Este link de redefinição é válido por 60 minutos. Se você não solicitou esta troca, apenas ignore esta mensagem.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #FAF7F6; border-top: 1px solid #E5DCDB; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9A8A88;">
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
