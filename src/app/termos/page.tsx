import Link from "next/link";
import { FileText, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso | Gastrointensivismo",
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
              Gastrointensivismo • Grupo MedCof
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
              O presente termo regula o acesso ao treinamento <strong>Gastrointensivismo</strong>, composto por aulas gravadas, bancos de questões, tromboelastogramas comentados, materiais de apoio e suporte acadêmico conforme o plano contratado (Plano Básico ou Plano Premium).
            </p>
            <p className="mt-2">
              O acesso é pessoal, individual e intransferível. É expressamente vedado o compartilhamento de credenciais com terceiros, sob pena de bloqueio irrevogável da conta e medidas cabíveis.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              2. Garantia Incondicional de 7 Dias
            </h2>
            <p>
              Em conformidade com o Artigo 49 do Código de Defesa do Consumidor, o aluno dispõe de até 7 (sete) dias corridos a partir da data de confirmação do pagamento para solicitar o cancelamento e reembolso integral do valor investido, sem qualquer complicação.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              3. Propriedade Intelectual
            </h2>
            <p>
              Todos os vídeos, slides, apostilas, casos clínicos e recursos disponibilizados na plataforma são de propriedade intelectual exclusiva do Gastrointensivismo e do Grupo MedCof, protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998).
            </p>
          </section>

          <section className="bg-[#FAF7F6] p-6 rounded-2xl border border-[#E5DCDB]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              4. Suporte ao Aluno e Atendimento
            </h2>
            <p className="text-xs sm:text-sm text-[#4F4645]">
              Para dúvidas pedagógicas, suporte de acesso, emissão de comprovantes ou solicitações administrativas:
            </p>
            <div className="mt-3 flex flex-col gap-1 text-xs sm:text-sm font-semibold text-[#1A1C1C]">
              <p>
                E-mail de Suporte:{" "}
                <a href="mailto:gastrointensiva@gmail.com" className="text-primary underline">
                  gastrointensiva@gmail.com
                </a>
              </p>
              <p>
                WhatsApp de Atendimento:{" "}
                <a
                  href="https://wa.me/553499782878?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20o%20treinamento%20Gastrointensivismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  +55 (34) 9978-2878 (Dra. Paula Mesquita)
                </a>
              </p>
            </div>
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
