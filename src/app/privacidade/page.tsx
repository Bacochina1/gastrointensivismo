import Link from "next/link";
import { ShieldCheck, FileText, Lock, Eye, RefreshCw, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade (LGPD) | Gastrointensivismo",
  description: "Política de Privacidade e Proteção de Dados em conformidade com a Lei nº 13.709/2018 (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#FAF7F6] py-16 px-4 sm:px-6 lg:px-8 text-[#1A1C1C]">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-[32px] border border-[#E5DCDB] shadow-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Início
        </Link>

        <div className="flex items-center gap-3.5 pb-6 border-b border-[#E5DCDB] mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Política de Privacidade &amp; LGPD
            </h1>
            <p className="text-xs sm:text-sm text-[#7F6E6C] mt-0.5">
              Conformidade integral com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais)
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-[#4F4645] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              1. Controlador de Dados e Finalidade do Tratamento
            </h2>
            <p>
              O <strong>Gastrointensivismo</strong> (Grupo MedCof) atua como controlador de dados pessoais no âmbito da prestação de serviços educacionais e fornecimento da plataforma de pós-graduação e treinamento médico. Os dados fornecidos (como nome completo, endereço de e-mail e dados transacionais de pagamento) são tratados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-[#5F4E4C]">
              <li>Identificação do aluno e liberação de credenciais de acesso às aulas e materiais pedagógicos;</li>
              <li>Processamento de pagamento e emissão de notas fiscais via Stripe Payments Brasil Ltda;</li>
              <li>Envio de comunicações pedagógicas, orientações de estudos e suporte acadêmico;</li>
              <li>Cumprimento de obrigações legais e regulatórias vigentes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              2. Base Legal e Segurança da Informação
            </h2>
            <p>
              O tratamento de seus dados está fundamentado no <strong>Artigo 7º, inciso V da LGPD</strong> (execução de contrato do qual o titular seja parte) e no legítimo interesse educacional.
            </p>
            <p className="mt-2">
              Adotamos rigorosos padrões técnicos e organizacionais de segurança:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs sm:text-sm text-[#5F4E4C]">
              <li>Senhas de acesso protegidas por algoritmo de derivação <strong>PBKDF2 com Salt criptográfico</strong> unidirecional;</li>
              <li>Tráfego de rede protegido por criptografia de ponta a ponta <strong>SSL/TLS 256 bits</strong> hospedado na infraestrutura de borda da Cloudflare;</li>
              <li>Acesso restrito a bancos de dados com autenticação estrita por credenciais criptografadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              3. Compartilhamento com Terceiros
            </h2>
            <p>
              Não realizamos qualquer venda, aluguel ou compartilhamento de dados com empresas de marketing externo. O compartilhamento ocorre apenas com os operadores estritamente necessários para a execução dos serviços contratados (Stripe para processamento de transações financeiras e Resend para envio de e-mails transacionais).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              4. Direitos do Titular (Art. 18 da LGPD)
            </h2>
            <p>
              Você, na qualidade de titular dos dados pessoais, pode exercer a qualquer momento os direitos previstos no Art. 18 da LGPD:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-[#5F4E4C]">
              <li>Confirmação da existência de tratamento e acesso aos dados cadastrados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
              <li>Portabilidade dos dados e revogação do consentimento nos termos da legislação.</li>
            </ul>
          </section>

          <section className="bg-[#FAF7F6] p-6 rounded-2xl border border-[#E5DCDB]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              5. Encarregado de Proteção de Dados (DPO)
            </h2>
            <p className="text-xs sm:text-sm text-[#4F4645]">
              Para exercer seus direitos ou tirar dúvidas sobre a nossa conformidade com a LGPD, envie uma mensagem diretamente para o nosso Encarregado de Dados:
            </p>
            <p className="mt-3 text-xs sm:text-sm font-bold text-[#1A1C1C]">
              E-mail do DPO: <a href="mailto:privacidade@grupomedcof.com.br" className="text-primary underline">privacidade@grupomedcof.com.br</a>
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E5DCDB] flex justify-between items-center text-xs text-[#7F6E6C]">
          <span>Última atualização: Agosto de 2026</span>
          <Link href="/" className="text-primary font-bold hover:underline">
            Voltar ao Gastrointensivismo
          </Link>
        </div>
      </div>
    </main>
  );
}
