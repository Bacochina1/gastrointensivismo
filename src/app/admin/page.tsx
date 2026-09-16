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

  // Check if already authenticated
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
    if (!phone) return <span className="text-gray-400 text-xs">-</span>;
    const cleanNumber = phone.replace(/\D/g, "");
    return (
      <a 
        href={`https://wa.me/${cleanNumber}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full transition-all"
        title="Conversar no WhatsApp"
      >
        <Phone className="w-3 h-3 text-emerald-600" />
        {phone}
        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#780201] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // TELA DE LOGIN - TEMA CLARO
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F6] flex items-center justify-center p-4 font-sans text-[#1A1C1C]">
        <div className="w-full max-w-md bg-white border border-[#E5DCDB] rounded-3xl p-8 sm:p-10 shadow-xl shadow-[#1A1C1C]/5">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block transition-transform hover:scale-105 mb-4">
              <img src="/logo.png" alt="Gastrointensivismo" className="h-10 w-auto mx-auto object-contain" />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#780201]/10 border border-[#780201]/20 text-[#780201] text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Painel Administrativo & CRM
            </div>
            <p className="text-xs text-[#5F4E4C] mt-2">
              Digite sua senha de acesso para gerenciar os alunos e leads.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#4F4645]" htmlFor="admin-password">
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
                className={`w-full bg-[#FAF7F6] border ${loginError ? "border-red-500" : "border-[#E5DCDB]"} rounded-xl px-4 py-3.5 text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] outline-none focus:border-[#780201] focus:ring-2 focus:ring-[#780201]/10 font-mono transition-all`}
              />
              {loginError && (
                <div className="text-xs text-red-600 font-medium mt-1">
                  {loginError}
                </div>
              )}
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#780201] text-white font-bold py-3.5 rounded-full shadow-md shadow-[#780201]/20 hover:bg-[#5C0101] transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 text-xs uppercase tracking-wider"
            >
              {loginLoading ? "Verificando..." : "Entrar no Painel"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#EAE2E0] text-center">
            <p className="text-[11px] text-[#7F6E6C]">
              Acesso restrito à coordenação • Gastrointensivismo © 2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-[#FAF7F6] font-sans text-[#1A1C1C]">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-[#EAE2E0] px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm shadow-black/5">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src="/logo.png" alt="Gastrointensivismo" className="h-8 w-auto object-contain" />
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#780201]/10 text-[#780201] text-[10px] font-extrabold uppercase tracking-wider border border-[#780201]/20">
            CRM Alunos & Vendas
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F4E4C] hover:text-[#780201] px-3.5 py-1.5 rounded-lg border border-[#E5DCDB] hover:border-[#780201]/30 hover:bg-[#FAF7F6] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1C]">
              Gestão de Alunos & Leads
            </h1>
            <p className="text-xs text-[#5F4E4C] mt-1">
              Visualize matrículas confirmadas, contatos de WhatsApp e progresso dos alunos em tempo real.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#E5DCDB] hover:border-[#780201] text-[#1A1C1C] hover:text-[#780201] px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow"
          >
            <Download className="w-4 h-4" />
            Exportar CSV / Excel
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-8">
            <div className="bg-white border border-[#E5DCDB] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F6E6C]">Total Alunos</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1C]">{stats.total}</div>
              <div className="text-[10px] text-gray-500 mt-1">Cadastrados no banco</div>
            </div>

            <div className="bg-white border border-[#E5DCDB] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F6E6C]">Acesso Ativo</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{stats.active}</div>
              <div className="text-[10px] text-gray-500 mt-1">Matrículas pagas</div>
            </div>

            <div className="bg-white border border-[#E5DCDB] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F6E6C]">Plano Premium</span>
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{stats.premium}</div>
              <div className="text-[10px] text-gray-500 mt-1">Com mentoria/acesso VIP</div>
            </div>

            <div className="bg-white border border-[#E5DCDB] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F6E6C]">Plano Básico</span>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">{stats.basic}</div>
              <div className="text-[10px] text-gray-500 mt-1">Curso padrão</div>
            </div>

            <div className="bg-white border border-[#E5DCDB] rounded-2xl p-4 shadow-sm col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F6E6C]">Com WhatsApp</span>
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.withPhone}</div>
              <div className="text-[10px] text-gray-500 mt-1">Leads contatáveis</div>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white border border-[#E5DCDB] rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#9A8A88] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-search"
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl text-xs sm:text-sm text-[#1A1C1C] placeholder:text-[#9A8A88] outline-none focus:border-[#780201] focus:ring-2 focus:ring-[#780201]/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Filter className="w-3.5 h-3.5 text-[#9A8A88] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="admin-filter"
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-8 py-2.5 bg-[#FAF7F6] border border-[#E5DCDB] rounded-xl text-xs sm:text-sm text-[#1A1C1C] outline-none focus:border-[#780201] cursor-pointer appearance-none"
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
              className="p-2.5 bg-[#FAF7F6] border border-[#E5DCDB] hover:border-[#780201] rounded-xl text-[#5F4E4C] hover:text-[#780201] transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white border border-[#E5DCDB] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F6] border-b border-[#EAE2E0] text-[11px] font-bold text-[#7F6E6C] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Aluno</th>
                  <th className="py-3.5 px-4">Telefone / WhatsApp</th>
                  <th className="py-3.5 px-4">Plano</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Aulas Concluídas</th>
                  <th className="py-3.5 px-4">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2E0] text-xs">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#7F6E6C]">
                      {dataLoading ? "Carregando alunos..." : "Nenhum aluno encontrado."}
                    </td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s.id} className="hover:bg-[#FAF7F6]/60 transition-colors">
                      {/* Name and Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A1C1C] text-sm">{s.name || "Sem Nome"}</div>
                        <div className="text-[11px] text-[#7F6E6C]">{s.email}</div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        {formatPhone(s.phone)}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        {s.plan === "elite" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-bold uppercase tracking-wider">
                            Básico
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {s.has_access ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            Bloqueado
                          </span>
                        )}
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[#EAE2E0] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#780201] rounded-full" 
                              style={{ width: `${Math.min(100, Math.round((s.lessons_done / TOTAL_LESSONS) * 100))}%` }} 
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#5F4E4C]">
                            {s.lessons_done}/{TOTAL_LESSONS}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-[#7F6E6C] text-[11px]">
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
            <div className="p-4 border-t border-[#EAE2E0] bg-[#FAF7F6] flex items-center justify-between">
              <span className="text-xs text-[#7F6E6C]">
                Página {page} de {totalPages} ({total} alunos)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-white border border-[#E5DCDB] rounded-lg text-xs font-bold text-[#5F4E4C] disabled:opacity-40 hover:border-[#780201] transition-all"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-white border border-[#E5DCDB] rounded-lg text-xs font-bold text-[#5F4E4C] disabled:opacity-40 hover:border-[#780201] transition-all"
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
