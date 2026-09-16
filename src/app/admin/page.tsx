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
  Filter
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

  // Valida autenticacao inicial
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body-md text-on-background">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-10 shadow-xl shadow-on-surface/5">
          {/* Top Branding */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block transition-transform hover:scale-105 mb-4">
              <img src="/logo.png" alt="Gastrointensivismo" className="h-10 w-auto mx-auto object-contain" />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Painel Administrativo
            </div>
            <p className="font-body-md text-sm text-on-surface-variant mt-2">
              Acesso exclusivo da coordenação para gestão de matrículas e alunos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-secondary uppercase tracking-wider" htmlFor="admin-password">
                Senha de Acesso
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(""); }}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className={`w-full bg-surface-container-low border ${loginError ? "border-error" : "border-outline-variant/40"} rounded-xl px-4 py-3.5 font-body-md text-sm text-on-background placeholder:text-secondary focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-mono`}
              />
              {loginError && (
                <div className="font-label-sm text-error font-medium mt-1">
                  {loginError}
                </div>
              )}
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold py-3.5 rounded-full shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 uppercase tracking-wider"
            >
              {loginLoading ? "Verificando..." : "Entrar no Painel"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-container-high text-center">
            <p className="font-label-sm text-secondary">
              Gastrointensivismo 2026 • Grupo MedCof
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-background">
      {/* Top Navbar */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm shadow-on-surface/5">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src="/logo.png" alt="Gastrointensivismo" className="h-8 w-auto object-contain" />
          </Link>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm uppercase tracking-wider border border-primary/20">
            Painel de Controle
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 font-label-md font-semibold text-secondary hover:text-primary px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold tracking-tight text-on-background">
              Gestão de Alunos & Leads
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant mt-1">
              Visualize matrículas confirmadas, contatos de WhatsApp e progresso de cada médico.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant/40 hover:border-primary text-on-surface hover:text-primary px-5 py-2.5 rounded-xl font-label-md font-semibold shadow-sm transition-all hover:shadow"
          >
            <Download className="w-4 h-4" />
            Exportar Planilha (CSV)
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {/* Total */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Total Geral</span>
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-on-background">{stats.total}</div>
              <div className="font-label-sm text-secondary mt-1">Cadastros totais</div>
            </div>

            {/* Ativos */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-tertiary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Acesso Ativo</span>
                <CheckCircle2 className="w-4 h-4 text-tertiary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-tertiary">{stats.active}</div>
              <div className="font-label-sm text-secondary mt-1">Matrículas confirmadas</div>
            </div>

            {/* Premium */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-primary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Plano Premium</span>
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-primary">{stats.premium}</div>
              <div className="font-label-sm text-secondary mt-1">Com Mentoria VIP</div>
            </div>

            {/* Basico */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-sm uppercase tracking-wider text-secondary">Plano Básico</span>
                <BookOpen className="w-4 h-4 text-secondary" />
              </div>
              <div className="font-headline-lg text-3xl font-bold text-on-background">{stats.basic}</div>
              <div className="font-label-sm text-secondary mt-1">Curso intensivo</div>
            </div>

            {/* Com WhatsApp */}
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
              className="p-2.5 bg-surface-container-low border border-outline-variant/30 hover:border-primary rounded-xl text-secondary hover:text-primary transition-all disabled:opacity-50 shrink-0"
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
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-secondary font-body-md">
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
                            Bloqueado
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
                  className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl font-semibold text-on-surface disabled:opacity-40 hover:border-primary transition-all"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl font-semibold text-on-surface disabled:opacity-40 hover:border-primary transition-all"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
