"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Modos de visualização da tela
  const [isSignUp, setIsSignUp] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const [isPostPurchase, setIsPostPurchase] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const isSuccess = searchParams.get("success") === "true";
    const isTemp = searchParams.get("temp") === "true";
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("reset_token");

    if (emailParam) {
      setEmail(emailParam);
    }

    // 1. Link de Redefinição de Senha vindo do E-mail (?reset_token=...&email=...)
    if (tokenParam) {
      setResetToken(tokenParam);
      setIsResetPassword(true);
      setIsForgotPassword(false);
      setIsSignUp(false);
      return;
    }

    // 2. Pós-compra confirmada no Stripe Checkout
    if (isSuccess || sessionId || isTemp) {
      setIsPostPurchase(true);
      setInfoMsg(
        "🎉 Compra confirmada! Enviamos seus dados e senha de acesso por e-mail. Se não encontrar em 2 minutos, verifique nas pastas de Spam ou Promoções."
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
              if (data.name) setName(data.name);
            }
          })
          .catch((err) => console.error("Erro ao verificar sessão pós-compra:", err));
      }
    }
  }, [searchParams]);

  // 1. Submit Login ou Primeiro Acesso
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessBanner("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, isLogin: !isSignUp }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Erro de autenticação. Verifique os dados digitados.");
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
      console.error("Erro no acesso:", err);
      setError("Erro de conexão com o servidor. Tente novamente.");
      setLoading(false);
    }
  };

  // 2. Solicitar E-mail de Esqueci Minha Senha
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessBanner("");

    if (!email) {
      setError("Por favor, digite seu e-mail.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-password", email }),
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

  // 3. Concluir Redefinição com Token do E-mail
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessBanner("");

    if (newPassword.length < 8) {
      setError("A nova senha deve conter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas digitadas não coincidem. Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", email, resetToken, newPassword }),
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
      setError("Erro ao redefinir senha. Tente novamente.");
      setLoading(false);
    }
  };

  // 4. Submit Troca Obrigatória de Senha (1º login com temp password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 8) {
      setError("A nova senha deve conter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem. Digite novamente.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-password", email, newPassword }),
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
      setError("Erro ao salvar nova senha. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col items-center justify-center p-4 lg:p-8 relative selection:bg-primary/20 selection:text-primary">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] bg-white p-8 sm:p-10 rounded-[28px] border border-[#EAE2E0] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.06)] relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            alt="Gastrointensivismo"
            className="h-10 w-auto object-contain mb-3.5"
            src="/logo.png"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A7876] uppercase tracking-wider">
            <span>Powered by</span>
            <img src="/logo-medcof.png" alt="MedCof" className="h-3.5 w-auto object-contain opacity-80" />
          </div>
        </div>

        {/* --- TELA 4: REDEFINIÇÃO DE SENHA VIA LINK DE E-MAIL (?reset_token=...) --- */}
        {isResetPassword ? (
          <div>
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-2.5">
                🔒 Redefinição de Senha
              </span>
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                Criar Nova Senha
              </h1>
              <p className="text-xs text-[#5F4E4C] leading-relaxed">
                Digite a nova senha para a conta <strong>{email}</strong>.
              </p>
            </div>

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                  htmlFor="resetNewPassword"
                >
                  Nova Senha (Mín. 8 caracteres)
                </label>
                <input
                  id="resetNewPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                  htmlFor="resetConfirmPassword"
                >
                  Confirmar Nova Senha
                </label>
                <input
                  id="resetConfirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? "Salvando nova senha..." : "SALVAR SENHA E ENTRAR"}
              </button>
            </form>
          </div>
        ) : mustChange ? (
          /* --- TELA 3: TROCA OBRIGATÓRIA DE SENHA NO 1º LOGIN --- */
          <div>
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-2.5">
                🔒 Redefinição Obrigatória
              </span>
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                Crie sua Nova Senha
              </h1>
              <p className="text-xs text-[#5F4E4C] leading-relaxed">
                Você entrou com a senha temporária inicial. Defina agora sua senha definitiva para continuar.
              </p>
            </div>

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                  htmlFor="newPassword"
                >
                  Nova Senha (Mín. 8 caracteres)
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                  htmlFor="confirmPassword"
                >
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? "Salvando nova senha..." : "SALVAR SENHA E ENTRAR"}
              </button>
            </form>
          </div>
        ) : isForgotPassword ? (
          /* --- TELA 2: SOLICITAÇÃO DE ESQUECI MINHA SENHA --- */
          <div>
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-2.5">
                🔑 Recuperação de Acesso
              </span>
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                Esqueceu sua senha?
              </h1>
              <p className="text-xs text-[#5F4E4C] leading-relaxed">
                Digite seu e-mail cadastrado na compra para receber o link de redefinição.
              </p>
            </div>

            {successBanner && (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#059669] text-base flex-shrink-0 mt-0.5">mark_email_read</span>
                <div>{successBanner}</div>
              </div>
            )}

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                  htmlFor="forgotEmail"
                >
                  Seu E-mail Cadastrado
                </label>
                <input
                  id="forgotEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? "Enviando link..." : "ENVIAR LINK DE RECUPERAÇÃO"}
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
          /* --- TELA 1: LOGIN TRADICIONAL / PRIMEIRO ACESSO / PÓS-COMPRA --- */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#1A1C1C] tracking-tight mb-1">
                {isPostPurchase ? "Área do Aluno" : isSignUp ? "Primeiro Acesso" : "Área do Aluno"}
              </h1>
              <p className="text-xs text-[#5F4E4C]">
                {isPostPurchase
                  ? "Digite o e-mail da compra e a senha enviada para seu e-mail."
                  : isSignUp
                  ? "Crie sua senha de acesso vinculada ao e-mail da compra."
                  : "Acesse as aulas e protocolos de Terapia Intensiva."}
              </p>
            </div>

            {/* Tab Toggle Segmentado */}
            {!isPostPurchase && (
              <div className="flex bg-[#F2ECEB] p-1 rounded-full mb-6 border border-[#E5DCDB]">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(""); }}
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                    !isSignUp
                      ? "bg-white text-primary shadow-sm"
                      : "text-[#7F6E6C] hover:text-[#1A1C1C]"
                  }`}
                >
                  Já tenho conta
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(""); }}
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                    isSignUp
                      ? "bg-white text-primary shadow-sm"
                      : "text-[#7F6E6C] hover:text-[#1A1C1C]"
                  }`}
                >
                  Primeiro Acesso
                </button>
              </div>
            )}

            {/* Banner de Aviso no Primeiro Acesso ou Pós-Compra */}
            {(infoMsg || isSignUp) && (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed shadow-sm flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#059669] text-base flex-shrink-0 mt-0.5">mark_email_read</span>
                <div>
                  {infoMsg || "✉️ Suas credenciais foram enviadas para o seu e-mail. Se não encontrar na caixa de entrada, confira na pasta de Spam ou Promoções. Ou defina sua senha abaixo:"}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[#FFF0F2] border border-[#FFCCD3] text-[#BC0028] text-xs p-3.5 rounded-xl mb-5 font-medium leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                    htmlFor="name"
                  >
                    Seu Nome Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="Dr. João Silva"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                  htmlFor="email"
                >
                  E-mail da Compra
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[11px] text-[#4F4645] uppercase tracking-wider font-bold"
                    htmlFor="password"
                  >
                    {isSignUp ? "Crie sua Senha (Mín. 8 dígitos)" : "Senha"}
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(""); }}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl px-4 py-3 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-full shadow-md shadow-primary/20 hover:bg-primary-container transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading
                  ? "Processando..."
                  : isSignUp
                  ? "CADASTRAR E ENTRAR NO CURSO"
                  : "ENTRAR NA PLATAFORMA"}
              </button>
            </form>
          </div>
        )}
      </div>
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
