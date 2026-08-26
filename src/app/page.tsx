import { CheckoutButton } from "@/components/CheckoutButton";
import { HeaderNav } from "@/components/HeaderNav";
import { StudentHeroCta } from "@/components/StudentHeroCta";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  Activity,
  Award,
  CheckCircle2,
  ChevronDown,
  Clock,
  HeartPulse,
  HelpCircle,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

export const revalidate = 86400; // Revalidação ISR a cada 24h para páginas instantâneas na CDN MedCof

export default function Home() {
  /* 
    Design Read: Medical education landing page for physicians and ICU residents.
    Theme: Clean Light Theme (MedCof UI Design System).
    Dials: DESIGN_VARIANCE=7, MOTION_INTENSITY=4, VISUAL_DENSITY=4.
  */

  return (
    <>
      {/* Header Navigation Dinâmico (Matricule-se vs Área do Aluno) */}
      <HeaderNav />

      <main className="w-full pt-20 bg-background">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <section className="relative w-full overflow-hidden bg-[#FAF7F6]">
            {/* Background Banners */}
            <div className="absolute inset-0 z-0">
              <picture className="w-full h-full block">
                <source media="(max-width: 1023px)" srcSet="/gastro-bg-2.png" />
                <img
                  src="/gastro-bg-1.png"
                  alt="Gastrointensivismo Treinamento Oficial"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-r from-[#FAF7F6] via-[#FAF7F6]/85 to-transparent lg:max-w-[65%]"></div>
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-[#FAF7F6] via-transparent to-transparent lg:hidden"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-16 sm:py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8 flex flex-col gap-stack-lg max-w-2xl">
                <div className="flex flex-col gap-stack-sm">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-xs font-semibold tracking-wider uppercase w-fit">
                    <Award className="w-3.5 h-3.5" />
                    <span>Treinamento Oficial 2026</span>
                    <span className="text-outline">|</span>
                    <img src="/logo-medcof.png" alt="MedCof Logo" className="h-4 w-auto object-contain" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-tight tracking-tight">
                    Gastrointensivismo |{" "}
                    <span className="text-primary font-light block mt-1">
                      Medicina Intensiva sem complicação
                    </span>
                  </h1>
                  <p className="font-body-lg text-on-surface-variant max-w-[620px] mt-stack-md leading-relaxed text-lg sm:text-xl">
                    O treinamento ideal para você alcançar a excelência na UTI
                  </p>
                </div>
                
                {/* CTA Dinâmico (Saiba Mais vs Acessar Meu Curso) */}
                <StudentHeroCta />

                {/* Hero Micro-Trust Bar */}
                <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-surface-variant/50 text-xs font-medium text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>30 Aulas Exclusivas</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-variant"></span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>4 Especialistas HCFMUSP</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-variant hidden sm:block"></span>
                  <div className="flex items-center gap-2 hidden sm:flex">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>100% Foco Prático em Plantão</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 hidden lg:block">
                {/* O fundo grafico do Hero preenche o lado direito */}
              </div>
            </div>
          </section>

          {/* Problem Section (Caso Clínico) - MedCof UI Card */}
          <section className="w-full py-24 px-margin-mobile lg:px-margin-desktop bg-surface-container-lowest" id="sobre">
            <div className="max-w-container-max mx-auto text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
                O Cenário Real
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                A UTI não permite erros
              </h2>
            </div>

            <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 bg-background rounded-[32px] overflow-hidden shadow-xl border border-surface-variant/80">
              <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center gap-6 border-b lg:border-b-0 lg:border-r border-surface-variant/60">
                <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-variant/40 relative shadow-inner">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-2xl"></div>
                  <p className="font-body-md text-base text-on-surface leading-relaxed font-medium">
                    Imagine a cena: paciente de 30 anos apresenta quadro de dor abdominal e náuseas. Após 10 dias, evoluiu com icterícia e rebaixamento do nível de consciencia.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <HeartPulse className="w-5 h-5 text-primary shrink-0" />
                  <p className="font-semibold text-primary text-base">
                    Você está responsável por seu atendimento.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="font-body-md text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    Perguntas decisivas no plantão:
                  </p>
                  <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-xl border border-surface-variant/60 shadow-sm">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-body-md text-on-surface text-sm lg:text-base leading-relaxed">
                      Quais são as hipóteses diagnósticas, etiologias, exames iniciais e tratamentos recomendados?
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative bg-gradient-to-br from-surface-container-low/80 to-surface-container-lowest flex items-center justify-center p-8 lg:p-12 overflow-hidden">
                <div className="relative z-10 text-center max-w-[340px] flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-primary/20">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-body-md text-base text-on-surface leading-relaxed font-semibold">
                    Se essa situação te deixa angustiado(a), o treinamento Gastrointensivismo pode ser seu grande aliado.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Section */}
          <section className="w-full py-24 px-margin-mobile lg:px-margin-desktop bg-background border-t border-surface-variant/40">
            <div className="max-w-container-max mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col gap-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest w-fit">
                    Metodologia Prática
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight leading-tight">
                    O que você vai aprender conosco
                  </h2>
                  <p className="font-body-md text-lg text-on-surface-variant leading-relaxed">
                    Formado por 4 intensivistas do Hospital das Clínicas (HCFMUSP), o Gastrointensivismo é mais do que um conjunto de aulas.
                  </p>
                  <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
                    Aqui, você terá acesso a conteúdos produzidos por especialistas no assunto, que te darão a objetividade necessária para agir nos plantões. Veja assuntos como:
                  </p>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-8">
                  {/* Topic Cards MedCof UI Style */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-surface-variant/80 shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center group hover:-translate-y-1">
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5 border border-primary/20 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <Stethoscope className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-on-surface tracking-tight">
                        Pacientes críticos com patologias gastrointestinais
                      </h3>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-surface-variant/80 shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center group hover:-translate-y-1">
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5 border border-primary/20 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <Activity className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-on-surface tracking-tight">
                        Pós-operatório de grandes cirurgias
                      </h3>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-surface-variant/80 shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center group hover:-translate-y-1">
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5 border border-primary/20 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <HeartPulse className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-on-surface tracking-tight">
                        Transplantados
                      </h3>
                    </div>
                  </div>

                  {/* Highlight Banner */}
                  <div className="bg-surface-container-lowest p-8 lg:p-10 rounded-[32px] border border-primary/30 shadow-xl relative overflow-hidden bg-gradient-to-br from-surface-container-lowest to-primary/5">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-body-md text-lg text-on-surface font-medium leading-relaxed">
                        Com 30 aulas exclusivas e divididas em seções bem definidas, nós entregamos o suprassumo teórico para sua rotina de trabalho ser muito mais segura.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Faculty Section - MedCof UI Design System */}
          <section
            className="w-full py-28 px-margin-mobile lg:px-margin-desktop bg-surface-container-lowest border-y border-surface-variant/40"
            id="professores"
          >
            <div className="max-w-container-max mx-auto">
              <div className="text-center mb-20 max-w-[840px] mx-auto">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4 shadow-sm">
                  <Users className="w-3.5 h-3.5" />
                  Corpo Docente especializado e com atuação na área
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-6">
                  Quem são os professores do Gastrointensivismo
                </h2>
                <p className="font-body-md text-lg text-on-surface-variant">
                  Conheça os especialistas da única UTI de gastrointensivismo do país que vão guiar o seu caminho nessa jornada.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                {/* Faculty 1: Bruna */}
                <div className="flex flex-col group bg-background p-6 rounded-[32px] border border-surface-variant/80 hover:border-primary/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div
                    className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-6 bg-cover bg-center border border-surface-variant/50 group-hover:border-primary/40 transition-colors shadow-md"
                    style={{ backgroundImage: "url('/professor-photo-bg.jpg')" }}
                  >
                    <img
                      alt="Foto Dra. Bruna Carla Scharanch"
                      className="w-full h-full object-cover relative z-0 transition-all duration-700 contrast-[1.05] brightness-[1.02] group-hover:scale-105 group-hover:contrast-[1.08]"
                      src="/bruna.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-white/40 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none z-10"></div>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight mb-4">
                    Bruna Carla Scharanch
                  </h3>
                  <ul className="flex flex-col gap-2.5 text-xs text-on-surface-variant font-body-md leading-snug flex-grow">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Medicina pela Universidade Federal do Triângulo Mineiro (UFTM)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Clínica Médica pelo Hospital das Clínicas da UFTM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Medicina Intensiva pelo Hospital das Clínicas da Faculdade de Medicina da Universidade de São Paulo (HCFMUSP)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Pós Graduação em Cuidados Paliativos pelo IEP Sírio Libanês</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Pós Graduação em Neurointensivismo pelo Einstein</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Título em Medicina Intensiva pela AMIB</span>
                    </li>
                    <li className="flex items-start gap-2 pt-2 border-t border-surface-variant/60 font-medium text-on-surface">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Atua como médica intensivista na UTI da Gastroenterologia do HCFMUSP e nas UTIs dos Hospitais São Luiz Itaim e Vila Nova Star</span>
                    </li>
                  </ul>
                </div>

                {/* Faculty 2: Lucas */}
                <div className="flex flex-col group bg-background p-6 rounded-[32px] border border-surface-variant/80 hover:border-primary/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div
                    className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-6 bg-cover bg-center border border-surface-variant/50 group-hover:border-primary/40 transition-colors shadow-md"
                    style={{ backgroundImage: "url('/professor-photo-bg.jpg')" }}
                  >
                    <img
                      alt="Foto Dr. Lucas de Oliveira Araújo"
                      className="w-full h-full object-cover relative z-0 transition-all duration-700 contrast-[1.05] brightness-[1.02] group-hover:scale-105 group-hover:contrast-[1.08]"
                      src="/lucas.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-white/40 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none z-10"></div>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight mb-4">
                    Lucas de Oliveira Araújo
                  </h3>
                  <ul className="flex flex-col gap-2.5 text-xs text-on-surface-variant font-body-md leading-snug flex-grow">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Medicina pela Escola Superior de Ciências da Saúde (DF)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Clínica Médica pela Casa de Saúde Santa Marcelina</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Medicina Intensiva pelo HCFMUSP</span>
                    </li>
                    <li className="flex items-start gap-2 pt-2 border-t border-surface-variant/60 font-medium text-on-surface">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Atua como médico intensivista na UTI da gastroenterologia do HCFMUSP e nas UTIs do Hospital Santa Isabel e Hospital Nove de Julho</span>
                    </li>
                  </ul>
                </div>

                {/* Faculty 3: Paula */}
                <div className="flex flex-col group bg-background p-6 rounded-[32px] border border-surface-variant/80 hover:border-primary/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div
                    className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-6 bg-cover bg-center border border-surface-variant/50 group-hover:border-primary/40 transition-colors shadow-md"
                    style={{ backgroundImage: "url('/professor-photo-bg.jpg')" }}
                  >
                    <img
                      alt="Foto Dra. Paula Sepulveda Mesquita"
                      className="w-full h-full object-cover relative z-0 transition-all duration-700 contrast-[1.05] brightness-[1.02] group-hover:scale-105 group-hover:contrast-[1.08]"
                      src="/paula.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-white/40 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none z-10"></div>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight mb-4">
                    Paula Sepulveda Mesquita
                  </h3>
                  <ul className="flex flex-col gap-2.5 text-xs text-on-surface-variant font-body-md leading-snug flex-grow">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Medicina pela Universidade de Uberaba</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Clínica Médica pelo HCFMUSP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Medicina Intensiva pelo HCFMUSP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Doutoranda em Ciências Médicas - Medicina Perioperatória - HCFMUSP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Título em Medicina Intensiva pela AMIB</span>
                    </li>
                    <li className="flex items-start gap-2 pt-2 border-t border-surface-variant/60 font-medium text-on-surface">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Atua como médica intensivista na UTI da Gastroenterologia do HCFMUSP e no Hospital Israelita Albert Einstein</span>
                    </li>
                  </ul>
                </div>

                {/* Faculty 4: Rodolpho */}
                <div className="flex flex-col group bg-background p-6 rounded-[32px] border border-surface-variant/80 hover:border-primary/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div
                    className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-6 bg-cover bg-center border border-surface-variant/50 group-hover:border-primary/40 transition-colors shadow-md"
                    style={{ backgroundImage: "url('/professor-photo-bg.jpg')" }}
                  >
                    <img
                      alt="Foto Dr. Rodolpho Pedro"
                      className="w-full h-full object-cover relative z-0 transition-all duration-700 contrast-[1.05] brightness-[1.02] group-hover:scale-105 group-hover:contrast-[1.08]"
                      src="/rodolpho.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-white/40 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none z-10"></div>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight mb-4">
                    Rodolpho Pedro
                  </h3>
                  <ul className="flex flex-col gap-2.5 text-xs text-on-surface-variant font-body-md leading-snug flex-grow">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Medicina pela Universidade Federal de Rondônia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Clínica Médica pelo HCFMUSP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Especialista em Medicina Intensiva pelo HCFMUSP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Doutor em Ciências Médicas - Medicina Perioperatória - HCFMUSP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Título em Medicina Intensiva pela AMIB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Presidente do Comitê de Gastrointensivismo AMIB - Biênio 2026-2027</span>
                    </li>
                    <li className="flex items-start gap-2 pt-2 border-t border-surface-variant/60 font-medium text-on-surface">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>Atua como médico intensivista na UTI da gastroenterologia do HCFMUSP e nas UTIs dos Hospitais São Luiz Itaim e Vila Nova Star</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section - Condição Especial (Restauração Oficial MedCof) */}
          <section className="w-full py-28 px-margin-mobile lg:px-margin-desktop relative overflow-hidden bg-[#FCF9F8]" id="planos">
            {/* Imagem de Fundo Mesclada em Tema Claro */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/bg-pricing-white.jpg"
                alt="Background Pricing White"
                className="w-full h-full object-cover opacity-75 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#FCF9F8]/50 via-transparent to-[#FCF9F8]/75" />
            </div>

            <div className="max-w-container-max mx-auto relative z-10">
              <div className="text-center mb-20 max-w-[800px] mx-auto">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4 shadow-sm">
                  Condição Especial
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-4">
                  Eleve o nível da sua carreira como intensivista
                </h2>
                <p className="font-body-md text-lg text-on-surface-variant">
                  Aproveite a condição especial e garanta sua vaga no nosso treinamento.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1100px] mx-auto items-stretch">
                {/* Plano Básico */}
                <div className="bg-surface-container-lowest/95 backdrop-blur-md relative p-8 lg:p-10 rounded-[32px] border border-surface-variant/80 hover:border-primary/40 flex flex-col justify-between shadow-xl transition-all">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-4 border border-surface-variant/60">
                      DESCONTO DE LANÇAMENTO (25% OFF APLICADO)
                    </div>

                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                        Formação Essencial
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight font-display">
                        Plano Básico
                      </h3>
                      <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
                        Domínio prático de Medicina Intensiva Gastrointestinal
                      </p>

                      <div className="mt-6 p-5 rounded-2xl bg-surface-container-low/60 border border-surface-variant/40 flex flex-col">
                        <span className="text-xs text-on-surface-variant line-through font-medium">
                          Preço cheio: R$ 2.800
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xs text-on-surface-variant font-semibold">
                            12x de
                          </span>
                          <span className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight font-display">
                            R$ 175
                          </span>
                        </div>
                        <span className="text-xs text-primary font-semibold mt-1">
                          ou R$ 2.100 à vista (25% OFF de lançamento já aplicado)
                        </span>
                        <div className="text-[11px] text-on-surface-variant mt-2 pt-2 border-t border-surface-variant/40 flex flex-col gap-0.5">
                          <span>Condição especial de lançamento: <strong>R$ 2.100</strong> (economia de R$ 700)</span>
                          <span>Preço cheio regular pós-lançamento: <strong>R$ 2.800</strong></span>
                        </div>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-3 mb-8 text-xs sm:text-sm text-on-surface font-body-md">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Aulas completas e aprofundadas</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Conteúdo focado em Terapia Intensiva</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Banco de questões de prova</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>30 tromboelastogramas comentados</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>6 meses de grupo no telegram com atualizações de artigos comentados</span>
                      </li>
                    </ul>
                  </div>

                  <CheckoutButton plan="regular" buttonText="GARANTIR PLANO BÁSICO" />
                </div>

                {/* Plano Premium */}
                <div className="bg-surface-container-lowest/95 backdrop-blur-md relative p-8 lg:p-10 rounded-[32px] border-2 border-primary flex flex-col justify-between shadow-2xl shadow-primary/20 ring-1 ring-primary/20">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-on-primary text-[11px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    MAIS COMPLETO &bull; 25% DE DESCONTO DE LANÇAMENTO APLICADO
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-4 border border-primary/20 mt-1">
                      EXPERIÊNCIA COMPLETA COM MENTORIA
                    </div>

                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                        Formação Avançada + Mentoria
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight font-display">
                        Plano Premium
                      </h3>
                      <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
                        Acesso total, comunidade de discussão de casos e mentoria direta
                      </p>

                      <div className="mt-6 p-5 rounded-2xl bg-surface-container-low/80 border border-primary/30 flex flex-col">
                        <span className="text-xs text-on-surface-variant line-through font-medium">
                          Preço cheio: R$ 3.800
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xs text-on-surface-variant font-semibold">
                            12x de
                          </span>
                          <span className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight font-display">
                            R$ 237,50
                          </span>
                        </div>
                        <span className="text-xs text-primary font-semibold mt-1">
                          ou R$ 2.850 à vista (25% OFF de lançamento já aplicado)
                        </span>
                        <div className="text-[11px] text-on-surface-variant mt-2 pt-2 border-t border-surface-variant/40 flex flex-col gap-0.5">
                          <span>Condição especial de lançamento: <strong>R$ 2.850</strong> (economia de R$ 950)</span>
                          <span>Preço cheio regular pós-lançamento: <strong>R$ 3.800</strong></span>
                        </div>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-3 mb-8 text-xs sm:text-sm text-on-surface font-body-md">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Aulas completas e aprofundadas</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Conteúdo focado em Terapia Intensiva</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Banco de questões de prova</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>30 tromboelastogramas comentados</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-medium text-on-surface">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>6 meses de Grupo no telegram com atualizações de artigos comentados</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-medium text-primary bg-primary/5 p-2 rounded-xl border border-primary/15">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>6 meses de Grupo exclusivo no telegram para discutir casos e tirar dúvidas</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-medium text-on-surface">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Disponibilidade dos slides das aulas em pdf</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-medium text-primary bg-primary/5 p-2 rounded-xl border border-primary/15">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Mentoria (2 reuniões online diretamente com os coordenadores)</span>
                      </li>
                    </ul>
                  </div>

                  <CheckoutButton plan="elite" buttonText="GARANTIR PLANO PREMIUM" />
                </div>
              </div>
            </div>
          </section>

          {/* Guarantee Section - MedCof UI Style */}
          <section className="w-full py-20 px-margin-mobile lg:px-margin-desktop bg-surface-container-lowest border-t border-surface-variant/40">
            <div className="max-w-[900px] mx-auto bg-surface-container-low/50 p-8 lg:p-12 rounded-[32px] border border-surface-variant/60 text-center flex flex-col items-center shadow-sm">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-on-surface mb-4 tracking-tight">
                Garantia incondicional
              </h2>
              <p className="font-body-md text-base lg:text-lg text-on-surface-variant mb-6 max-w-[700px] leading-relaxed">
                Você tem o direito de arrependimento garantido. Oferecemos a devolução integral do valor investido dentro do prazo de 7 dias.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-on-primary text-sm font-bold tracking-wider uppercase shadow-sm">
                Seu risco é zero
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="w-full py-28 px-margin-mobile lg:px-margin-desktop bg-background border-t border-surface-variant/40" id="faq">
            <div className="max-w-[900px] mx-auto flex flex-col gap-8">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
                  Tire Suas Dúvidas
                </span>
                <h2 className="text-4xl font-bold text-on-surface tracking-tight">
                  Perguntas frequentes
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* FAQ 1 */}
                <details className="group bg-surface-container-lowest border border-surface-variant/60 rounded-[20px] overflow-hidden cursor-pointer shadow-sm" open>
                  <summary className="flex items-center justify-between p-6 font-body-md text-lg text-on-surface font-semibold list-none [&::-webkit-details-marker]:hidden hover:bg-surface-container-low/50 transition-colors">
                    Para quem é indicado o treinamento Gastrointensivismo?
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="p-6 pt-0 text-body-md text-base text-on-surface-variant font-body-md bg-surface-container-lowest leading-relaxed border-t border-surface-variant/30 mt-2">
                    Este curso é desenhado para médicos intensivistas, residentes de Medicina Intensiva, plantonistas e especialistas que desejam dominar o manejo de complicações gastrointestinais no ambiente de UTI. Se você busca mais segurança para tomar decisões em casos de pacientes críticos, pós-operatórios complexos ou transplantados, este treinamento é para você.
                  </div>
                </details>

                {/* FAQ 2 */}
                <details className="group bg-surface-container-lowest border border-surface-variant/60 rounded-[20px] overflow-hidden cursor-pointer shadow-sm">
                  <summary className="flex items-center justify-between p-6 font-body-md text-lg text-on-surface font-semibold list-none [&::-webkit-details-marker]:hidden hover:bg-surface-container-low/50 transition-colors">
                    O treinamento oferece certificado de conclusão?
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="p-6 pt-0 text-body-md text-base text-on-surface-variant font-body-md bg-surface-container-lowest leading-relaxed border-t border-surface-variant/30 mt-2">
                    Sim! Ao finalizar o curso, você receberá um certificado de conclusão, que pode ser utilizado para enriquecer o seu currículo profissional e comprovar a atualização em tópicos de alta complexidade na Medicina Intensiva.
                  </div>
                </details>

                {/* FAQ 3 */}
                <details className="group bg-surface-container-lowest border border-surface-variant/60 rounded-[20px] overflow-hidden cursor-pointer shadow-sm">
                  <summary className="flex items-center justify-between p-6 font-body-md text-lg text-on-surface font-semibold list-none [&::-webkit-details-marker]:hidden hover:bg-surface-container-low/50 transition-colors">
                    Por quanto tempo terei acesso às aulas?
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="p-6 pt-0 text-body-md text-base text-on-surface-variant font-body-md bg-surface-container-lowest leading-relaxed border-t border-surface-variant/30 mt-2">
                    Você terá acesso completo ao conteúdo por 1 ano a partir da data de confirmação da sua compra. Isso permite que você estude no seu próprio ritmo, revise os conteúdos antes de plantões desafiadores e acompanhe as atualizações necessárias.
                  </div>
                </details>

                {/* FAQ 4 */}
                <details className="group bg-surface-container-lowest border border-surface-variant/60 rounded-[20px] overflow-hidden cursor-pointer shadow-sm">
                  <summary className="flex items-center justify-between p-6 font-body-md text-lg text-on-surface font-semibold list-none [&::-webkit-details-marker]:hidden hover:bg-surface-container-low/50 transition-colors">
                    Posso assistir pelo celular ou apenas no computador?
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="p-6 pt-0 text-body-md text-base text-on-surface-variant font-body-md bg-surface-container-lowest leading-relaxed border-t border-surface-variant/30 mt-2">
                    Você pode acessar o treinamento de qualquer dispositivo — computador, tablet ou celular. Sabemos da rotina intensa de quem trabalha em UTI, por isso a plataforma é 100% responsiva para que você estude nos intervalos do plantão ou no seu tempo livre.
                  </div>
                </details>

                {/* FAQ 5 */}
                <details className="group bg-surface-container-lowest border border-surface-variant/60 rounded-[20px] overflow-hidden cursor-pointer shadow-sm">
                  <summary className="flex items-center justify-between p-6 font-body-md text-lg text-on-surface font-semibold list-none [&::-webkit-details-marker]:hidden hover:bg-surface-container-low/50 transition-colors">
                    Como funciona a metodologia MedCof?
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="p-6 pt-0 text-body-md text-base text-on-surface-variant font-body-md bg-surface-container-lowest leading-relaxed border-t border-surface-variant/30 mt-2">
                    A metodologia MedCof é aprovada por mais de 35 mil alunos e se baseia na síntese do que há de mais relevante na literatura médica. Transformamos conteúdos complexos em estratégias práticas e objetivas para o seu dia a dia médico.
                  </div>
                </details>

                {/* FAQ 6 */}
                <details className="group bg-surface-container-lowest border border-surface-variant/60 rounded-[20px] overflow-hidden cursor-pointer shadow-sm">
                  <summary className="flex items-center justify-between p-6 font-body-md text-lg text-on-surface font-semibold list-none [&::-webkit-details-marker]:hidden hover:bg-surface-container-low/50 transition-colors">
                    E se eu não gostar do treinamento?
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="p-6 pt-0 text-body-md text-base text-on-surface-variant font-body-md bg-surface-container-lowest leading-relaxed border-t border-surface-variant/30 mt-2">
                    Nós temos tanta confiança na qualidade do nosso material e na segurança que ele vai te trazer que oferecemos uma Garantia Incondicional de 7 dias. Se, por qualquer motivo, você sentir que o curso não atende às suas expectativas, basta solicitar o reembolso dentro desse prazo e devolveremos 100% do valor investido. Sem burocracia.
                  </div>
                </details>

                {/* FAQ 7 - Contato e Suporte */}
                <details className="group bg-surface-container-lowest border border-surface-variant/60 rounded-[20px] overflow-hidden cursor-pointer shadow-sm">
                  <summary className="flex items-center justify-between p-6 font-body-md text-lg text-on-surface font-semibold list-none [&::-webkit-details-marker]:hidden hover:bg-surface-container-low/50 transition-colors">
                    Como entro em contato para tirar dúvidas sobre o curso ou formas de pagamento?
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="p-6 pt-0 text-body-md text-base text-on-surface-variant font-body-md bg-surface-container-lowest leading-relaxed border-t border-surface-variant/30 mt-2">
                    Você pode falar diretamente com a coordenação do Gastrointensivismo pelo WhatsApp <strong>+55 (34) 9978-2878</strong> (Dra. Paula Mesquita) ou através do e-mail <strong>gastrointensiva@gmail.com</strong>. Estamos à disposição para tirar qualquer dúvida sobre a grade curricular, metodologia ou suporte acadêmico.
                  </div>
                </details>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer - MedCof UI Style */}
      <footer className="w-full bg-surface-container-lowest py-20 border-t border-surface-variant/40">
        <div className="max-w-container-max mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-stack-sm">
                <img
                  alt="Gastrointensivismo Logo"
                  className="h-8 w-auto object-contain"
                  src="/logo.png"
                />
              </div>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Powered by MedCof — Excelência acadêmica e autoridade clínica na UTI.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label-sm text-xs text-on-surface uppercase tracking-widest font-semibold">
                Navegação
              </h4>
              <nav className="flex flex-col gap-2.5">
                <a
                  className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors"
                  href="#sobre"
                >
                  O Treinamento
                </a>
                <a
                  className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors"
                  href="#professores"
                >
                  Corpo Docente
                </a>
                <a
                  className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors"
                  href="#planos"
                >
                  Planos e Valores
                </a>
                <a
                  className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors"
                  href="#faq"
                >
                  Perguntas Frequentes
                </a>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label-sm text-xs text-on-surface uppercase tracking-widest font-semibold">
                Suporte &amp; Contato
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/553499782878?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20o%20treinamento%20Gastrointensivismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-xs text-on-surface-variant hover:text-primary transition-colors group"
                >
                  <span className="w-7 h-7 rounded-full bg-[#25D366]/15 text-[#1ebc59] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#25D366] group-hover:text-white transition-all mt-0.5">
                    W
                  </span>
                  <div>
                    <span className="font-bold text-on-surface block text-xs">WhatsApp Suporte</span>
                    <span className="text-[11px] text-[#7F6E6C]">+55 (34) 9978-2878 (Dra. Paula Mesquita)</span>
                  </div>
                </a>

                <a
                  href="mailto:gastrointensiva@gmail.com"
                  className="flex items-start gap-2.5 text-xs text-on-surface-variant hover:text-primary transition-colors group"
                >
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-all mt-0.5">
                    @
                  </span>
                  <div>
                    <span className="font-bold text-on-surface block text-xs">E-mail de Suporte</span>
                    <span className="text-[11px] text-[#7F6E6C]">gastrointensiva@gmail.com</span>
                  </div>
                </a>
              </div>

              <nav className="flex flex-col gap-2 pt-2 border-t border-surface-variant/40">
                <a
                  className="font-body-md text-xs text-on-surface-variant hover:text-primary transition-colors"
                  href="/termos"
                >
                  Termos de Uso
                </a>
                <a
                  className="font-body-md text-xs text-on-surface-variant hover:text-primary transition-colors"
                  href="/privacidade"
                >
                  Política de Privacidade (LGPD)
                </a>
              </nav>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-surface-variant/40 text-center">
            <p className="font-label-sm text-xs text-on-surface-variant">
              © Gastrointensivismo | Powered by MedCof. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante de Suporte via WhatsApp */}
      <WhatsAppButton />
    </>
  );
}
