import Link from "next/link";
import { FileText, ShieldCheck, CheckCircle2, ArrowLeft, AlertTriangle, Scale, Lock, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Termos de Uso & Condições Gerais | Gastrointensivismo",
  description: "Termos de Uso e Condições Gerais de Contratação do treinamento Gastrointensivismo.",
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
              Gastrointensivismo &bull; Powered by MedCof &bull; CNPJ: 67.058.614/0001-03
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-[#4F4645] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              1. Objeto do Contrato e Acesso à Plataforma
            </h2>
            <p>
              O presente instrumento regula os termos e condições de acesso e utilização do treinamento <strong>Gastrointensivismo</strong>, programa de capacitação e aprimoramento profissional continuado voltado a médicos, residentes e pós-graduandos. O programa é composto por 30 videoaulas temáticas em alta definição, bancos de questões comentadas, biblioteca de traçados de tromboelastograma (TEG) comentados, materiais didáticos de apoio em PDF e suporte pedagógico conforme o plano contratado (Plano Básico ou Plano Premium com Mentoria).
            </p>
            <p className="mt-2">
              O acesso concedido é de <strong>6 (seis) meses ininterruptos</strong> a partir da data de confirmação do pagamento, com credenciais de caráter <strong>estritamente pessoal, individual e intransferível</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              2. Garantia Legal Incondicional de 7 Dias (Artigo 49 do CDC)
            </h2>
            <p>
              Em estrito cumprimento ao <strong>Artigo 49 da Lei Federal nº 8.078/1990 (Código de Defesa do Consumidor)</strong> e ao <strong>Decreto Federal nº 7.962/2013 (Comércio Eletrônico)</strong>, o contratante tem o direito de desistir da compra no prazo de <strong>7 (sete) dias corridos</strong> a contar da confirmação do pagamento e disponibilização do acesso.
            </p>
            <p className="mt-2">
              A solicitação de reembolso pode ser exercida a qualquer momento dentro deste prazo, independentemente de justificativa, através dos canais oficiais (e-mail <em>gastrointensiva@gmail.com</em> ou WhatsApp oficial). O reembolso será processado de forma integral (100% do valor pago), com estorno conduzido pela intermediadora de pagamento Mercado Pago na mesma modalidade de pagamento utilizada (estorno na fatura do cartão ou devolução Pix).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              3. Natureza do Treinamento e Normas Éticas Médicas (CFM)
            </h2>
            <p>
              Em cumprimento integral à <strong>Resolução CFM nº 2.336/2023</strong> do Conselho Federal de Medicina:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs sm:text-sm text-[#4F4645]">
              <li>
                O Gastrointensivismo constitui <strong>curso livre de capacitação, atualização e aprimoramento profissional continuado</strong>, fundamentado na melhor literatura científica e prática baseada em evidências.
              </li>
              <li>
                O presente treinamento <strong>NÃO substitui a Residência Médica</strong> e <strong>NÃO confere título de especialista</strong> perante o Conselho Federal de Medicina (CFM), Conselho Regional de Medicina (CRM) ou Associação Médica Brasileira (AMB).
              </li>
              <li>
                A concessão de títulos de especialista no Brasil é prerrogativa exclusiva de programas credenciados pela Comissão Nacional de Residência Médica (CNRM/MEC) ou mediante aprovação em concurso oficial de títulos da respectiva sociedade de especialidade conveniada à AMB.
              </li>
              <li>
                O conteúdo apresentado tem finalidade técnico-científica e de educação médica, não constituindo garantia de resultados clínicos individuais, mantendo-se a atividade médica como obrigação de meio e não de resultado.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-primary" />
              4. Meios de Pagamento e Segurança das Transações
            </h2>
            <p>
              As transações financeiras são intermediadas pela <strong>Mercado Pago Instituição de Pagamento Ltda.</strong> (CNPJ: 10.573.521/0001-91), entidade regulada pelo Banco Central do Brasil com certificação de segurança internacional <strong>PCI-DSS Nível 1</strong>.
            </p>
            <p className="mt-2">
              Os dados de cartão de crédito não são armazenados em nossos servidores, sendo criptografados e processados diretamente no ambiente seguro do Mercado Pago. O parcelamento em até 12 (doze) vezes no cartão de crédito opera sob as regras e condições informadas no momento do checkout.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              5. Propriedade Intelectual e Vedação ao Rateio (Lei nº 9.610/1998)
            </h2>
            <p>
              Todas as 30 videoaulas, slides, apostilas, casos clínicos, traçados de TEG, fluxogramas e materiais didáticos são de <strong>propriedade intelectual exclusiva</strong> do Gastrointensivismo e de seu corpo docente, protegidos pela <strong>Lei de Direitos Autorais (Lei Federal nº 9.610/1998)</strong>.
            </p>
            <p className="mt-2">
              É terminantemente proibido:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs sm:text-sm text-[#4F4645]">
              <li>Compartilhar credenciais de acesso (login e senha) com terceiros;</li>
              <li>A prática de rateio (aquisição coletiva ou compras em grupo);</li>
              <li>Copiar, gravar, ripar, distribuir, transmitir publicamente ou comercializar qualquer conteúdo da plataforma.</li>
            </ul>
            <p className="mt-2">
              A identificação de acessos simultâneos anômalos ou compartilhamento indevido ensejará o <strong>bloqueio imediato e definitivo do acesso</strong>, sem direito a qualquer restituição, sem prejuízo da apuração de perdas e danos e das sanções penais cabíveis (Artigo 184 do Código Penal).
            </p>
          </section>

          <section className="bg-[#FAF7F6] p-6 rounded-2xl border border-[#E5DCDB]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              6. Dados do Fornecedor &amp; Canais Oficiais de Atendimento
            </h2>
            <p className="text-xs sm:text-sm text-[#4F4645]">
              Em atendimento ao Decreto nº 7.962/2013, disponibilizamos canais diretos e expeditos para suporte pedagógico, dúvidas acadêmicas, cancelamentos ou questões administrativas:
            </p>
            <div className="mt-3 flex flex-col gap-1.5 text-xs sm:text-sm font-semibold text-[#1A1C1C]">
              <p>
                Razão Social / Plataforma: <span className="font-normal">Gastrointensivismo (Powered by MedCof)</span>
              </p>
              <p>
                CNPJ: <span className="font-normal">67.058.614/0001-03</span>
              </p>
              <p>
                E-mail Oficial:{" "}
                <a href="mailto:gastrointensiva@gmail.com" className="text-primary underline">
                  gastrointensiva@gmail.com
                </a>
              </p>
              <p>
                WhatsApp Oficial de Atendimento:{" "}
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
                Horário de Atendimento: Segunda a sexta-feira, das 08h às 18h (horário de Brasília). Prazos de resposta em até 1 (um) dia útil.
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
