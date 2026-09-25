"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Download, 
  RefreshCw, 
  LogOut, 
  Phone, 
  BookOpen, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Filter,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Lock
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  plan: string;
  has_access: number;
  stripe_id: string | null;
  created_at: string;
  lessons_done: number;
}

interface Stats {
  total: number;
  active: number;
  premium: number;
  basic: number;
  withPhone: number;
}

const TOTAL_LESSONS = 30;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  // Estados do Modal de Reembolso & Ações
  const [refundModalUser, setRefundModalUser] = useState<Student | null>(null);
  const [refundReason, setRefundReason] = useState("requested_by_customer");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [refundSuccess, setRefundSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const handleSyncMercadoPago = async () => {
    setSyncLoading(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_mercadopago" }),
        credentials: "include"
      });
      const data = await res.json() as any;
      if (res.ok && data.success) {
        setSyncMsg(data.message);
        loadStudents();
        loadStats();
      } else {
        alert(data.error || "Erro ao sincronizar com Mercado Pago");
      }
    } catch (e: any) {
      alert("Erro na comunicacao com o servidor: " + e.message);
    } finally {
      setSyncLoading(false);
    }
  };

  // Valida autenticação inicial
  useEffect(() => {
    fetch("/api/admin?action=stats", { credentials: "include" })
      .then(r => {
        if (r.ok) { setIsAuthenticated(true); return r.json(); }
        throw new Error("not auth");
      })
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const loadStudents = useCallback(async () => {
    setDataLoading(true);
    try {
      const params = new URLSearchParams({ action: "users", search, filter, page: String(page) });
      const r = await fetch(`/api/admin?${params}`, { credentials: "include" });
      if (r.ok) {
        const data = await r.json() as { users: Student[]; total: number };
        setStudents(data.users);
        setTotal(data.total);
      }
    } finally {
      setDataLoading(false);
    }
  }, [search, filter, page]);

  const loadStats = useCallback(async () => {
    const r = await fetch("/api/admin?action=stats", { credentials: "include" });
    if (r.ok) setStats(await r.json());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
      loadStats();
    }
  }, [isAuthenticated, loadStudents, loadStats]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
        credentials: "include",
      });
      const data = await r.json() as { success?: boolean; error?: string };
      if (r.ok && data.success) {
        setIsAuthenticated(true);
        setIsLoading(true);
        await loadStats();
        setIsLoading(false);
      } else {
        setLoginError(data.error || "Senha incorreta. Tente novamente.");
      }
    } catch {
      setLoginError("Erro de comunicação com o servidor.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
      credentials: "include",
    });
    setIsAuthenticated(false);
    setPassword("");
    setStudents([]);
    setStats(null);
  };

  // Executa o Reembolso Oficial na Stripe e Bloqueia Acesso
  const handleProcessRefund = async () => {
    if (!refundModalUser) return;
    setRefundLoading(true);
    setRefundError("");
    setRefundSuccess("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "refund",
          userId: refundModalUser.id,
          reason: refundReason,
        }),
        credentials: "include",
      });
      const data = await res.json() as { success?: boolean; error?: string; message?: string; refundId?: string };
      if (res.ok && data.success) {
        setRefundSuccess(data.message || "Reembolso efetuado com sucesso na Stripe e acesso cancelado.");
        setTimeout(() => {
          setRefundModalUser(null);
          setRefundSuccess("");
          loadStudents();
          loadStats();
        }, 1800);
      } else {
        setRefundError(data.error || "Não foi possível processar o reembolso na Stripe.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de conexão ao processar reembolso.";
      setRefundError(msg);
    } finally {
      setRefundLoading(false);
    }
  };

  // Alterna o status de acesso manualmente
  const handleToggleAccess = async (student: Student) => {
    const newAccess = student.has_access ? 0 : 1;
    const confirmMsg = newAccess === 1 
      ? `Deseja reativar o acesso de ${student.name || student.email}?`
      : `Deseja bloquear o acesso de ${student.name || student.email}?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(student.id);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_access",
          userId: student.id,
          hasAccess: newAccess,
        }),
        credentials: "include",
      });
      if (res.ok) {
        loadStudents();
        loadStats();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Nome", "Email", "Telefone", "Plano", "Acesso", "Stripe ID", "Data Cadastro", "Aulas Concluidas"];
    const rows = students.map(s => [
      s.id,
      `"${s.name || ""}"`,
      s.email,
      `"${s.phone || ""}"`,
      s.plan === "elite" ? "Premium" : "Basico",
      s.has_access ? "Ativo" : "Bloqueado",
      s.stripe_id || "",
      s.created_at || "",
      `${s.lessons_done}/${TOTAL_LESSONS}`
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alunos-gastro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return <span className="text-secondary font-body-md text-xs">-</span>;
    const cleanNumber = phone.replace(/\D/g, "");
    return (
      <a 
        href={`https://wa.me/${cleanNumber}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-tertiary hover:text-tertiary-container font-medium font-label-sm bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 px-3 py-1 rounded-full transition-all"
        title="Conversar no WhatsApp"
      >
        <Phone className="w-3.5 h-3.5 text-tertiary" />
        {phone}
        <ExternalLink className="w-3 h-3 opacity-60" />
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // TELA DE LOGIN - CLINICAL ELITE DESIGN SYSTEM
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Gastrointensivismo" className="h-10 w-auto" />
            </Link>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-secondary border border-outline-variant/30 font-label-sm uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Painel de Gestão &bull; CRM
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-on-background tracking-tight">
              Acesso Administrativo
            </h2>
            <p className="mt-1 font-body-md text-sm text-secondary">
              Gerenciamento de matrículas, suporte e garantia da Turma 2026.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 py-8 px-6 shadow-sm rounded-2xl sm:px-10">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block font-label-md text-on-background font-semibold mb-1.5" htmlFor="admin-pass">
                  Senha de Acesso
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Digite a senha mestra..."
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-background placeholder:text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error font-body-md text-xs">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-label-md font-bold text-on-primary bg-primary hover:bg-primary-container focus:outline-none transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Entrar no Painel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Top Navigation */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block">
                <img src="/logo.png" alt="Gastrointensivismo" className="h-8 w-auto" />
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-sm font-semibold uppercase tracking-wider">
                Turma 2026
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                disabled={students.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-secondary" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-secondary hover:text-error font-label-md text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Sair do painel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Total Geral</span>
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-on-background">{stats.total}</div>
              <div className="font-label-sm text-secondary mt-1">Cadastros totais</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-tertiary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Acesso Ativo</span>
                <CheckCircle2 className="w-4 h-4 text-tertiary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-tertiary">{stats.active}</div>
              <div className="font-label-sm text-secondary mt-1">Matrículas confirmadas</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-primary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Plano Premium</span>
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-primary">{stats.premium}</div>
              <div className="font-label-sm text-secondary mt-1">Com Mentoria VIP</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Plano Básico</span>
                <BookOpen className="w-4 h-4 text-secondary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-on-background">{stats.basic}</div>
              <div className="font-label-sm text-secondary mt-1">Curso intensivo</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-tertiary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Com WhatsApp</span>
                <Phone className="w-4 h-4 text-tertiary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-tertiary">{stats.withPhone}</div>
              <div className="font-label-sm text-secondary mt-1">Contatos diretos</div>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-search"
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-background placeholder:text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-52">
              <Filter className="w-3.5 h-3.5 text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="admin-filter"
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-8 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-label-md text-sm text-on-background outline-none focus:border-primary cursor-pointer appearance-none"
              >
                <option value="all">Todos os planos</option>
                <option value="regular">Somente Básico</option>
                <option value="elite">Somente Premium</option>
              </select>
            </div>

            <button
              onClick={loadStudents}
              disabled={dataLoading}
              title="Atualizar lista"
              className="p-2.5 bg-surface-container-low border border-outline-variant/30 hover:border-primary rounded-xl text-secondary hover:text-primary transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        {/* Students Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-md">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 font-label-sm text-secondary uppercase tracking-wider">
                  <th className="py-4 px-4">Aluno</th>
                  <th className="py-4 px-4">Telefone / WhatsApp</th>
                  <th className="py-4 px-4">Plano</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Aulas Assistidas</th>
                  <th className="py-4 px-4">Data Cadastro</th>
                  <th className="py-4 px-4 text-right">Ações &amp; Garantia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-secondary font-body-md">
                      {dataLoading ? "Carregando alunos..." : "Nenhum aluno encontrado com estes filtros."}
                    </td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s.id} className="hover:bg-surface-container-low/60 transition-colors">
                      {/* Name and Email */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-on-background font-label-md">{s.name || "Aluno Sem Nome"}</div>
                        <div className="font-body-md text-xs text-secondary">{s.email}</div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4">
                        {formatPhone(s.phone)}
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-4">
                        {s.plan === "elite" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-sm uppercase tracking-wider font-semibold">
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-secondary border border-outline-variant/30 font-label-sm uppercase tracking-wider font-semibold">
                            Básico
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {s.has_access ? (
                          <span className="inline-flex items-center gap-1.5 text-tertiary font-label-md font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-tertiary" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-error font-label-md font-semibold">
                            <XCircle className="w-4 h-4 text-error" />
                            Revogado
                          </span>
                        )}
                      </td>

                      {/* Progress */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all" 
                              style={{ width: `${Math.min(100, Math.round((s.lessons_done / TOTAL_LESSONS) * 100))}%` }} 
                            />
                          </div>
                          <span className="font-label-sm font-semibold text-on-surface-variant">
                            {s.lessons_done}/{TOTAL_LESSONS}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 text-secondary font-label-sm">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString("pt-BR") : "-"}
                      </td>

                      {/* Actions & Refund Column */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {s.has_access === 1 ? (
                            <>
                              <button
                                onClick={() => {
                                  setRefundModalUser(s);
                                  setRefundError("");
                                  setRefundSuccess("");
                                }}
                                title="Processar reembolso de garantia (estorno Stripe)"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 font-label-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                                <span>Reembolsar</span>
                              </button>

                              <button
                                onClick={() => handleToggleAccess(s)}
                                disabled={actionLoadingId === s.id}
                                title="Bloquear acesso temporariamente"
                                className="p-1.5 rounded-lg border border-outline-variant/30 hover:border-error text-secondary hover:text-error transition-all cursor-pointer"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                Reembolsado / Bloqueado
                              </span>
                              <button
                                onClick={() => handleToggleAccess(s)}
                                disabled={actionLoadingId === s.id}
                                title="Reativar acesso do aluno"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant/30 hover:border-tertiary text-secondary hover:text-tertiary font-label-sm font-semibold transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                                <span>Reativar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex items-center justify-between font-label-sm">
              <span className="text-secondary">
                Página {page} de {totalPages} ({total} alunos)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl font-semibold text-on-surface disabled:opacity-40 hover:border-primary transition-all cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl font-semibold text-on-surface disabled:opacity-40 hover:border-primary transition-all cursor-pointer"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE CONFIRMAÇÃO DE REEMBOLSO VIA STRIPE */}
      {refundModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-md text-lg font-bold text-on-background">
                  Confirmar Reembolso &amp; Garantia
                </h3>
                <p className="font-label-sm text-secondary">
                  Devolução oficial do valor investido via gateway de pagamento
                </p>
              </div>
            </div>

            {/* Student Info Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 mb-4 text-sm">
              <div className="grid grid-cols-2 gap-2 font-label-sm">
                <div>
                  <span className="text-secondary">Aluno:</span>
                  <p className="font-bold text-on-background">{refundModalUser.name || "Aluno"}</p>
                </div>
                <div>
                  <span className="text-secondary">Plano:</span>
                  <p className="font-bold text-primary">
                    {refundModalUser.plan === "elite" ? "Premium (com Mentoria)" : "Básico"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-secondary">E-mail:</span>
                  <p className="font-bold text-on-background truncate">{refundModalUser.email}</p>
                </div>
                {refundModalUser.stripe_id && (
                  <div className="col-span-2">
                    <span className="text-secondary">ID Transação ({/^\d+$/.test(refundModalUser.stripe_id.trim()) ? "Mercado Pago" : "Stripe"}):</span>
                    <p className="font-mono text-xs text-secondary truncate">{refundModalUser.stripe_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5">Operação Definitiva de Garantia:</strong>
                Esta ação solicitará o <strong>estorno de 100% do valor pago</strong> diretamente no gateway ({/^\d+$/.test(refundModalUser.stripe_id.trim()) ? "Mercado Pago" : "Stripe"} - devolvido na fatura do cartão ou via Pix) e <strong>revogará o acesso à plataforma imediatamente</strong>.
              </div>
            </div>

            {/* Motivo do Reembolso */}
            <div className="mb-5">
              <label htmlFor="refund-reason-select" className="block font-label-sm text-secondary font-semibold mb-1.5">
                Motivo da Devolução
              </label>
              <select
                id="refund-reason-select"
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-label-md text-sm text-on-background outline-none focus:border-primary cursor-pointer"
              >
                <option value="requested_by_customer">Garantia Incondicional de 7 Dias (Solicitação do Aluno)</option>
                <option value="duplicate">Cobrança Duplicada / Involuntária</option>
                <option value="fraudulent">Transação Não Reconhecida</option>
              </select>
            </div>

            {/* Erro ou Sucesso */}
            {refundError && (
              <div className="p-3 mb-4 bg-error/10 border border-error/20 rounded-xl text-error font-body-md text-xs">
                {refundError}
              </div>
            )}
            {syncMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {syncMsg}
              </div>
              <button onClick={() => setSyncMsg("")} className="text-emerald-700 hover:underline">Fechar</button>
            </div>
          )}
          {refundSuccess && (
              <div className="p-3 mb-4 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary font-body-md text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
                {refundSuccess}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => setRefundModalUser(null)}
                disabled={refundLoading}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/30 font-label-md text-xs font-semibold text-secondary hover:bg-surface-container-low transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleProcessRefund}
                disabled={refundLoading || !!refundSuccess}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-error text-white font-label-md text-xs font-bold hover:opacity-90 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {refundLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando estorno oficial...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirmar e Devolver Dinheiro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
