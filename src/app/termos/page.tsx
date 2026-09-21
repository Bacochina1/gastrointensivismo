import Link from "next/link";
import { FileText, ShieldCheck, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Termos de Uso & Condições Gerais | Gastrointensivismo",
  description: "Termos de Uso e Condições Gerais do treinamento Gastrointensivismo.",
};

export default function TermosPage() {
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Termos de Uso &amp; Condições Gerais
            </h1>
            <p className="text-xs sm:text-sm text-[#7F6E6C] mt-0.5">
              Gastrointensivismo • Powered by MedCof • CNPJ: 67.058.614/0001-03
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-[#4F4645] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              1. Objeto e Acesso à Plataforma
            </h2>
            <p>
              O presente termo regula o acesso ao treinamento <strong>Gastrointensivismo</strong>, composto por aulas gravadas em alta definição, bancos de questões comentadas, biblioteca de traçados de tromboelastometria comentados, materiais de apoio em PDF e suporte pedagógico conforme o plano contratado (Plano Básico ou Formação Avançada com Mentoria).
            </p>
            <p className="mt-2">
              O acesso à plataforma é <strong>pessoal, individual e intransferível</strong>. É expressamente proibido o compartilhamento de credenciais, gravação ou rateio com terceiros, sob pena de bloqueio irrevogável da conta e medidas cíveis e criminais cabíveis.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              2. Garantia Incondicional de 7 Dias (Art. 49 do CDC)
            </h2>
            <p>
              Em estrita conformidade com o <strong>Artigo 49 do Código de Defesa do Consumidor (CDC)</strong> e o Decreto Federal nº 7.962/2013, o aluno dispõe de até <strong>7 (sete) dias corridos</strong> a partir da data de confirmação do pagamento para solicitar o cancelamento e reembolso integral do valor investido, sem burocracia ou justificativa, com estorno processado diretamente pela plataforma Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              3. Natureza do Treinamento &amp; Normas Ético-Profissionais (CFM)
            </h2>
            <p>
              Em conformidade com a <strong>Resolução CFM nº 2.336/2023</strong> do Conselho Federal de Medicina, esclarece-se que o treinamento Gastrointensivismo constitui <strong>curso livre de aprimoramento e capacitação profissional continuada</strong> em medicina intensiva e gastroenterologia clínica de alta complexidade.
            </p>
            <p className="mt-2">
              O presente curso <strong>não substitui a Residência Médica</strong> e <strong>não confere título de especialista</strong> perante o Conselho Federal de Medicina (CFM) ou Associação Médica Brasileira (AMB). A obtenção de título de especialista depende exclusivamente de aprovação em prova de título das sociedades conveniadas ou conclusão de residência médica credenciada pela CNRM/MEC.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              4. Propriedade Intelectual &amp; Direitos Autorais
            </h2>
            <p>
              Todas as 30 videoaulas, slides, apostilas, casos clínicos, traçados e recursos disponibilizados na plataforma são de <strong>propriedade intelectual exclusiva</strong> do Gastrointensivismo e do corpo docente, protegidos pela <strong>Lei de Direitos Autorais (Lei Federal nº 9.610/1998)</strong>. É estritamente vedada a reprodução, cópia, retransmissão ou comercialização não autorizada de qualquer material.
            </p>
          </section>

          <section className="bg-[#FAF7F6] p-6 rounded-2xl border border-[#E5DCDB]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              5. Dados do Fornecedor &amp; Canais de Atendimento
            </h2>
            <p className="text-xs sm:text-sm text-[#4F4645]">
              Para dúvidas pedagógicas, solicitações de reembolso, suporte técnico ou questões administrativas:
            </p>
            <div className="mt-3 flex flex-col gap-1 text-xs sm:text-sm font-semibold text-[#1A1C1C]">
              <p>
                E-mail de Atendimento:{" "}
                <a href="mailto:gastrointensiva@gmail.com" className="text-primary underline">
                  gastrointensiva@gmail.com
                </a>
              </p>
              <p>
                WhatsApp Oficial de Suporte:{" "}
                <a
                  href="https://wa.me/553499782878?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20o%20treinamento%20Gastrointensivismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  +55 (34) 9978-2878 (Dra. Paula Mesquita)
                </a>
              </p>
              <p className="text-xs text-secondary font-normal mt-1">
                Atendimento de segunda a sexta, das 08h às 18h (horário de Brasília).
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
