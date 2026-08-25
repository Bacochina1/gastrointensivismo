"use client";

import { useState } from "react";
import { ShieldCheck, X, FileText, Lock, Eye, RefreshCw } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] border border-[#E5DCDB] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#1A1C1C]">
        {/* Header */}
        <div className="p-6 border-b border-[#E5DCDB] flex items-center justify-between bg-[#FAF7F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1C1C] font-display">
                Política de Privacidade &amp; Termos (LGPD)
              </h2>
              <p className="text-xs text-[#7F6E6C]">
                Em conformidade com a Lei Federal nº 13.709/2018 (LGPD)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EAE2E0] hover:bg-[#DCD4D2] flex items-center justify-center text-[#4F4645] transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#4F4645] leading-relaxed">
          <section>
            <h3 className="text-sm font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              1. Controlador de Dados e Finalidade
            </h3>
            <p>
              O <strong>Gastrointensivismo</strong> (Grupo MedCof) atua como controlador de dados pessoais no âmbito da prestação de serviços educacionais em medicina intensiva. Os dados coletados (como nome, endereço de e-mail e dados cadastrais da compra) são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-[#5F4E4C]">
              <li>Identificação do aluno e liberação de acesso à plataforma de aulas e materiais;</li>
              <li>Processamento de pagamento seguro via Stripe Payments Brasil Ltda;</li>
              <li>Envio de credenciais de acesso, notificações pedagógicas e comunicados oficiais;</li>
              <li>Emissão de documentos fiscais e cumprimento de obrigações legais.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              2. Base Legal e Armazenamento Seguro
            </h3>
            <p>
              O tratamento de dados é realizado sob a base legal de <strong>Execução de Contrato (Art. 7º, V da LGPD)</strong> e cumprimento de obrigações regulatórias.
            </p>
            <p className="mt-1">
              Todas as senhas são armazenadas utilizando criptografia unidirecional com derivação de chave <strong>PBKDF2 com Salt criptográfico</strong>. As conexões e transações são protegidas por criptografia <strong>SSL/TLS de 256 bits</strong> hospedadas na infraestrutura global da Cloudflare.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              3. Compartilhamento e Sigilo
            </h3>
            <p>
              Nenhum dado pessoal é comercializado, alugado ou repassado a terceiros para fins de marketing externo. O compartilhamento ocorre estritamente com os processadores essenciais para a prestação do serviço (gateway de pagamento Stripe e provedor transacional de e-mails Resend).
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#1A1C1C] flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              4. Direitos do Titular dos Dados (Art. 18 da LGPD)
            </h3>
            <p>
              Você, como titular dos dados, possui o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-[#5F4E4C]">
              <li>Confirmação da existência de tratamento e acesso aos dados cadastrados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Revogação de consentimento e exclusão de conta após a conclusão do curso.</li>
            </ul>
          </section>

          <section className="bg-[#FAF7F6] p-4 rounded-2xl border border-[#E5DCDB]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
              5. Contato do Encarregado de Dados (DPO)
            </h3>
            <p className="text-xs text-[#4F4645]">
              Para exercer qualquer um dos seus direitos da LGPD ou esclarecer dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados:
            </p>
            <p className="mt-2 text-xs font-semibold text-[#1A1C1C]">
              E-mail de Privacidade: <a href="mailto:privacidade@grupomedcof.com.br" className="text-primary underline">privacidade@grupomedcof.com.br</a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5DCDB] bg-[#FAF7F6] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-container transition-all shadow-sm"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
