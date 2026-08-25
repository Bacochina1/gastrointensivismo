"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { PrivacyModal } from "@/components/PrivacyModal";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Modos de visualização da tela
  const [mustChange, setMustChange] = useState(false);
  const [isPostPurchase, setIsPostPurchase] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isSuccess = searchParams.get("success") === "true";
    const sessionId = searchParams.get("session_id");
    const tokenParam = searchParams.get("reset_token");
    const emailParam = searchParams.get("email");
    const isTemp = searchParams.get("temp") === "true";

    if (emailParam) {
      setEmail(emailParam);
    }

    // 1. Link de Redefinição de Senha vindo do E-mail (?reset_token=...&email=...)
    if (tokenParam) {
      setResetToken(tokenParam);
      setIsResetPassword(true);
      setIsForgotPassword(false);
      return;
    }

    // 2. Pós-compra confirmada no Stripe Checkout
    if (isSuccess || sessionId || isTemp) {
      setIsPostPurchase(true);
      setInfoMsg(
        "🎉 Compra confirmada! Suas credenciais e dados de acesso foram enviados para o seu e-mail. Digite sua senha para entrar na plataforma:"
      );

      if (sessionId) {
        fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify-session", sessionId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.email) {
              setEmail(data.email);
            }
          })
          .catch((err) => console.error("Erro ao verificar sessão pós-compra:", err));
      }
    }
  }, [searchParams]);

  // 1. Login do Aluno
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessBanner("");

    const normalizedEmail = email.toLowerCase().trim();
    const sessionId = searchParams.get("session_id");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: normalizedEmail, 
          password, 
          isLogin: true,
          sessionId 
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "E-mail ou senha inválidos. Verifique os dados digitados.");
        setLoading(false);
      } else {
        if (data.user?.mustChangePassword) {
          setMustChange(true);
          setLoading(false);
        } else {
          localStorage.setItem("gastro_user", JSON.stringify(data.user));
          router.push("/aluno");
        }
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro de conexão com o servidor. Tente novamente.");
      setLoading(false);
    }
  };

  // 2. Solicitar Link de Recuperação / Reenvio de Acesso
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessBanner("");

    if (!email) {
      setError("Por favor, digite seu e-mail de compra.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-password", email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Erro ao processar solicitação.");
      } else {
        setSuccessBanner(data.message || "Se este e-mail possuir cadastro, as instruções foram enviadas para a sua caixa de entrada.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Erro ao solicitar recuperação:", err);
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  // 3. Salvar Nova Senha via Token
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 8) {
      setError("A nova senha deve ter no mínimo 8 caracteres.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          email: email.toLowerCase().trim(),
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Erro ao redefinir senha.");
        setLoading(false);
      } else {
        localStorage.setItem("gastro_user", JSON.stringify(data.user));
        router.push("/aluno");
      }
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setError("Erro de conexão com o servidor.");
      setLoading(false);
    }
  };

  // 4. Troca Obrigatória de Senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 8) {
      setError("A nova senha deve ter no mínimo 8 caracteres.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          email: email.toLowerCase().trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Erro ao atualizar senha.");
        setLoading(false);
      } else {
        localStorage.setItem("gastro_user", JSON.stringify(data.user));
        router.push("/aluno");
      }
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      setError("Erro de conexão com o servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col justify-center items-center px-4 py-12 text-[#1A1C1C]">
      {/* Top Header Branding */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="transition-transform hover:scale-105 mb-3">
          <img
            src="/logo.png"
            alt="Gastrointensivismo Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE2E0] text-[11px] font-bold text-[#4F4645] uppercase tracking-wider">
          <span>Powered by</span>
          <img src="/logo-medcof.png" alt="MedCof" className="h-3 w-auto object-contain" />
        </div>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-md bg-white border border-[#E5DCDB] rounded-[28px] p-8 sm:p-10 shadow-xl shadow-[#1A1C1C]/5 transition-all">
        
        {/* TELA 3: REDEFINIÇÃO DE SENHA VIA LINK */}
        {isResetPassword ? (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                Nova Senha de Acesso
              </h1>
              <p className="text-xs text-[#5F4E4C]">
                Defina sua nova senha para acessar a plataforma.
              </p>
            </div>

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold">
                  E-mail do Aluno
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#F2ECEB] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#7F6E6C] cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold" htmlFor="resetNewPassword">
                  Nova Senha (Mín. 8 dígitos)
                </label>
                <input
                  id="resetNewPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold" htmlFor="resetConfirmPassword">
                  Confirmar Nova Senha
                </label>
                <input
                  id="resetConfirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? "Salvando..." : "SALVAR SENHA E ENTRAR"}
              </button>
            </form>
          </div>
        ) : mustChange ? (
          /* TELA 2: TROCA OBRIGATÓRIA DE SENHA NO 1º LOGIN */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                Cadastrar Senha Pessoal
              </h1>
              <p className="text-xs text-[#5F4E4C]">
                Por segurança, crie sua senha definitiva para os próximos acessos.
              </p>
            </div>

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold" htmlFor="newPassword">
                  Sua Nova Senha (Mín. 8 dígitos)
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold" htmlFor="confirmPassword">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? "Salvando..." : "CONFIRMAR SENHA E ENTRAR"}
              </button>
            </form>
          </div>
        ) : isForgotPassword ? (
          /* TELA 4: ESQUECI MINHA SENHA */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                Recuperar Acesso
              </h1>
              <p className="text-xs text-[#5F4E4C]">
                Digite o e-mail cadastrado na compra para receber as instruções e o link de acesso.
              </p>
            </div>

            {successBanner && (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs p-4 rounded-xl mb-5 font-medium leading-relaxed shadow-sm">
                {successBanner}
              </div>
            )}

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold" htmlFor="forgotEmail">
                  E-mail da Compra
                </label>
                <input
                  id="forgotEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? "Enviando..." : "ENVIAR INSTRUÇÕES DE ACESSO"}
              </button>

              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setError(""); setSuccessBanner(""); }}
                className="w-full mt-1 text-xs text-[#7F6E6C] hover:text-primary font-bold py-2 transition-colors text-center"
              >
                ← Voltar para o Login
              </button>
            </form>
          </div>
        ) : (
          /* TELA 1: LOGIN OFICIAL DO ALUNO */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                Área do Aluno
              </h1>
              <p className="text-xs text-[#5F4E4C]">
                {isPostPurchase
                  ? "Digite seu e-mail e sua senha para entrar na plataforma."
                  : "Acesse as aulas e protocolos de Terapia Intensiva."}
              </p>
            </div>

            {/* Banner Informativo Pós-Compra */}
            {infoMsg && (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed shadow-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                <div>{infoMsg}</div>
              </div>
            )}

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold" htmlFor="email">
                  E-mail Cadastrado
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold" htmlFor="password">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(""); }}
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? "Entrando..." : "ENTRAR NA PLATAFORMA"}
              </button>
            </form>

            {/* Rodapé do Card: Ajuda e Link para Compra */}
            <div className="mt-6 pt-6 border-t border-[#EAE2E0] flex flex-col gap-3 text-center">
              <p className="text-xs text-[#7F6E6C]">
                Ainda não é aluno?{" "}
                <Link href="/#planos" className="text-primary font-bold hover:underline">
                  Conheça os planos e matricule-se →
                </Link>
              </p>

              <div className="mt-1 pt-2 border-t border-[#EAE2E0]/60 flex items-center justify-center gap-3 text-[11px] text-[#9A8A88]">
                <span>Ambiente Seguro SSL 256-bit</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="hover:text-primary hover:underline font-medium"
                >
                  Termos &amp; Privacidade (LGPD)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F6] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
