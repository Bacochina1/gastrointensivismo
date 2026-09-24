import Link from "next/link";
import { ShieldCheck, FileText, Lock, Eye, RefreshCw, ArrowLeft, UserCheck, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade (LGPD) • CNPJ: 67.058.614/0001-03 | Gastrointensivismo",
  description: "Política de Privacidade e Proteção de Dados Pessoais em conformidade com a Lei nº 13.709/2018 (LGPD).",
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
              1. Controlador de Dados e Finalidades do Tratamento
            </h2>
            <p>
              O <strong>Gastrointensivismo</strong> (Powered by MedCof &bull; CNPJ: 67.058.614/0001-03) atua como controlador de dados pessoais no âmbito da disponibilização de treinamentos médicos e fornecimento da plataforma de ensino. Os dados pessoais coletados (nome completo, e-mail, telefone/WhatsApp e dados transacionais de compra) destinam-se exclusivamente às seguintes finalidades:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-[#4F4645]">
              <li>Identificação do aluno e liberação imediata de credenciais de acesso às 30 aulas e materiais didáticos;</li>
              <li>Processamento seguro de pagamento e emissão de notas fiscais;</li>
              <li>Envio de comunicações acadêmicas, orientações de estudos e suporte pedagógico;</li>
              <li>Cumprimento de obrigações legais, regulatórias e fiscais vigentes;</li>
              <li>Registro de logs de conexão e acesso em atendimento ao Marco Civil da Internet (Lei nº 12.965/2014, Artigo 15).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              2. Bases Legais e Padrões de Segurança da Informação
            </h2>
            <p>
              O tratamento de dados pessoais é fundamentado estritamente nas seguintes hipóteses legais previstas no <strong>Artigo 7º da LGPD</strong>:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs sm:text-sm text-[#4F4645]">
              <li><strong>Inciso V (Execução de Contrato):</strong> para viabilizar a entrega do treinamento contratado;</li>
              <li><strong>Inciso II (Cumprimento de Obrigação Legal/Regulatória):</strong> para fins contábeis, fiscais e auditoria;</li>
              <li><strong>Inciso IX (Legítimo Interesse):</strong> para prevenção a fraudes e garantia da segurança dos serviços.</li>
            </ul>
            <p className="mt-3">
              Adotamos os mais rigorosos padrões técnicos e organizacionais de segurança:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs sm:text-sm text-[#4F4645]">
              <li>Senhas criptografadas com derivação <strong>PBKDF2 com Salt criptográfico</strong> unidirecional;</li>
              <li>Tráfego de rede protegido por criptografia de ponta a ponta <strong>SSL/TLS 256 bits (HTTPS)</strong> na infraestrutura de borda da Cloudflare;</li>
              <li>Banco de dados Cloudflare D1 em conformidade com normas internacionais de segurança e isolamento lógico;</li>
              <li>Dados de pagamento de cartões processados exclusivamente no ambiente com certificação <strong>PCI-DSS Nível 1</strong> do Mercado Pago.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              3. Compartilhamento Restrito com Operadores
            </h2>
            <p>
              O Gastrointensivismo <strong>NÃO comercializa, aluga ou compartilha</strong> dados pessoais com terceiros para fins de publicidade externa. O compartilhamento ocorre exclusivamente com operadores essenciais à operacionalização do serviço:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-[#4F4645]">
              <li><strong>Mercado Pago Instituição de Pagamento Ltda.:</strong> processamento seguro de pagamentos via Pix e cartão de crédito;</li>
              <li><strong>Resend Technologies Inc.:</strong> envio de e-mails transacionais (credenciais de acesso, confirmações e avisos importantes);</li>
              <li><strong>Cloudflare Inc.:</strong> hospedagem de alta disponibilidade e proteção contra ataques de negação de serviço (DDoS).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              4. Direitos do Titular de Dados (Artigo 18 da LGPD)
            </h2>
            <p>
              O titular dos dados pessoais pode exercer, a qualquer momento e mediante requisição simples, os seguintes direitos:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-[#4F4645]">
              <li>Confirmação da existência de tratamento e acesso aos dados pessoais;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço, mediante requisição expressa;</li>
              <li>Eliminação dos dados pessoais tratados com o consentimento, ressalvadas as hipóteses de guarda obrigatória por lei ou fins fiscais;</li>
              <li>Revogação do consentimento nos termos da legislação.</li>
            </ul>
          </section>

          <section className="bg-[#FAF7F6] p-6 rounded-2xl border border-[#E5DCDB]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              5. Encarregado de Proteção de Dados (DPO) e Contato
            </h2>
            <p className="text-xs sm:text-sm text-[#4F4645]">
              Para exercer seus direitos de titular ou esclarecer qualquer dúvida sobre a privacidade e o tratamento dos seus dados, entre em contato diretamente com o nosso Encarregado de Proteção de Dados:
            </p>
            <div className="mt-3 flex flex-col gap-1.5 text-xs sm:text-sm font-semibold text-[#1A1C1C]">
              <p>
                Canal Oficial LGPD:{" "}
                <a href="mailto:gastrointensiva@gmail.com" className="text-primary underline">
                  gastrointensiva@gmail.com
                </a>
              </p>
              <p>
                WhatsApp de Atendimento:{" "}
                <a
                  href="https://wa.me/553499782878?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20privacidade%20e%20LGPD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  +55 (34) 9978-2878 (Dra. Paula Mesquita)
                </a>
              </p>
              <p className="text-xs text-secondary font-normal mt-1">
                Prazo de atendimento a requisições do titular: em até 15 (quinze) dias corridos, nos termos do Artigo 19, II da LGPD.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E5DCDB] flex justify-between items-center text-xs text-[#7F6E6C]">
          <span>Última atualização: Setembro de 2026</span>
          <Link href="/" className="text-primary font-bold hover:underline">
            Voltar ao Gastrointensivismo
          </Link>
        </div>
      </div>
    </main>
  );
}
