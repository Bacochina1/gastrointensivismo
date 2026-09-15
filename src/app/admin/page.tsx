"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";

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
        setLoginError(data.error || "Senha incorreta");
      }
    } catch {
      setLoginError("Erro de conexao. Tente novamente.");
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
    setStudents([]);
    setStats(null);
    setPassword("");
  };

  const exportCSV = () => {
    const header = "Nome,Email,Telefone,Plano,Acesso,Aulas Concluidas,Cadastro";
    const rows = students.map(s =>
      [
        `"${s.name || ""}"`,
        `"${s.email}"`,
        `"${s.phone || ""}"`,
        s.plan === "elite" ? "Premium" : "Basico",
        s.has_access ? "Ativo" : "Bloqueado",
        `${s.lessons_done}/${TOTAL_LESSONS}`,
        s.created_at ? new Date(s.created_at).toLocaleDateString("pt-BR") : "",
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alunos-gastro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return <span style={{ color: "#6B7280", fontSize: "11px" }}>—</span>;
    return <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
      style={{ color: "#25D366", textDecoration: "none", fontWeight: 600, fontSize: "13px" }}>{phone}</a>;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #780201", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F0F0F 0%, #1A0000 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", padding: "20px" }}>
        <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 20, padding: "48px 40px", width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <img src="/logo.png" alt="Gastrointensivismo" style={{ height: 40, objectFit: "contain", filter: "brightness(1.1)" }} />
            <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#780201" }}>PAINEL ADMINISTRATIVO</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 8 }}>
                Senha de Administrador
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(""); }}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#1E1E1E", border: `1.5px solid ${loginError ? "#EF4444" : "#2A2A2A"}`,
                  borderRadius: 10, padding: "13px 16px",
                  fontSize: 15, color: "#F9FAFB",
                  outline: "none", fontFamily: "monospace", letterSpacing: "2px",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { if (!loginError) e.target.style.borderColor = "#780201"; }}
                onBlur={e => { if (!loginError) e.target.style.borderColor = "#2A2A2A"; }}
              />
              {loginError && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#EF4444", fontWeight: 500 }}>
                  {loginError}
                </div>
              )}
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loginLoading}
              style={{
                width: "100%", background: loginLoading ? "#4B0000" : "#780201",
                color: "#FFF", border: "none", borderRadius: 10,
                padding: "14px 24px", fontSize: 14, fontWeight: 700,
                cursor: loginLoading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px", transition: "background 0.2s",
              }}
            >
              {loginLoading ? "Verificando..." : "Entrar no Painel"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#4B5563" }}>
            Acesso restrito — Gastrointensivismo © 2026
          </p>
        </div>
      </div>
    );
  }

  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: "#F9FAFB" }}>

      {/* Top Nav */}
      <nav style={{ background: "#111111", borderBottom: "1px solid #1F1F1F", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="Gastrointensivismo" style={{ height: 28, objectFit: "contain" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#780201" }}>Admin CRM</span>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: "transparent", border: "1px solid #2A2A2A", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#9CA3AF", cursor: "pointer" }}
        >
          Sair
        </button>
      </nav>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
            {[
              { label: "Total de Alunos", value: stats.total, color: "#3B82F6", icon: "👥" },
              { label: "Alunos Ativos", value: stats.active, color: "#10B981", icon: "✅" },
              { label: "Plano Premium", value: stats.premium, color: "#F59E0B", icon: "⭐" },
              { label: "Plano Basico", value: stats.basic, color: "#8B5CF6", icon: "📚" },
              { label: "Com Telefone", value: stats.withPhone, color: "#25D366", icon: "📱" },
            ].map(card => (
              <div key={card.label} style={{
                background: "#141414", border: "1px solid #1F1F1F", borderRadius: 14,
                padding: "20px 22px", borderLeft: `3px solid ${card.color}`
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, fontWeight: 500 }}>{card.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            id="admin-search"
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              flex: 1, minWidth: 240, background: "#141414", border: "1px solid #2A2A2A",
              borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#F9FAFB", outline: "none",
            }}
          />

          <select
            id="admin-filter"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
            style={{
              background: "#141414", border: "1px solid #2A2A2A", borderRadius: 10,
              padding: "10px 14px", fontSize: 13, color: "#F9FAFB", cursor: "pointer", outline: "none",
            }}
          >
            <option value="all">Todos os planos</option>
            <option value="regular">Somente Basico</option>
            <option value="elite">Somente Premium</option>
          </select>

          <button
            id="admin-refresh-btn"
            onClick={loadStudents}
            style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#9CA3AF", cursor: "pointer", fontWeight: 600 }}
          >
            ↻ Atualizar
          </button>

          <button
            id="admin-export-btn"
            onClick={exportCSV}
            style={{ background: "#780201", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, color: "#FFF", cursor: "pointer", fontWeight: 700 }}
          >
            ↓ Exportar CSV
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#111111", border: "1px solid #1F1F1F", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#0D0D0D", borderBottom: "1px solid #1F1F1F" }}>
                  {["Nome", "E-mail", "Telefone / WhatsApp", "Plano", "Status", "Aulas", "Cadastro"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6B7280", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 48, color: "#6B7280" }}>
                      Carregando...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 48, color: "#6B7280" }}>
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                ) : students.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #1A1A1A", background: i % 2 === 0 ? "transparent" : "#0E0E0E" }}>
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: "#F3F4F6", maxWidth: 180 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name || "—"}</div>
                    </td>
                    <td style={{ padding: "13px 16px", color: "#9CA3AF" }}>
                      <a href={`mailto:${s.email}`} style={{ color: "#9CA3AF", textDecoration: "none" }}>{s.email}</a>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {formatPhone(s.phone)}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: s.plan === "elite" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
                        color: s.plan === "elite" ? "#F59E0B" : "#818CF8",
                        border: `1px solid ${s.plan === "elite" ? "rgba(245,158,11,0.3)" : "rgba(99,102,241,0.3)"}`,
                      }}>
                        {s.plan === "elite" ? "PREMIUM" : "BASICO"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: s.has_access ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                        color: s.has_access ? "#10B981" : "#EF4444",
                        border: `1px solid ${s.has_access ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      }}>
                        {s.has_access ? "ATIVO" : "BLOQUEADO"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: "#2A2A2A", borderRadius: 4, minWidth: 60 }}>
                          <div style={{ height: "100%", background: "#780201", borderRadius: 4, width: `${Math.round((s.lessons_done / TOTAL_LESSONS) * 100)}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                          {s.lessons_done}/{TOTAL_LESSONS}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", color: "#6B7280", fontSize: 12, whiteSpace: "nowrap" }}>
                      {s.created_at ? new Date(s.created_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "16px 20px", borderTop: "1px solid #1F1F1F", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#6B7280" }}>
                Mostrando {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} de {total} alunos
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: page === 1 ? "#4B5563" : "#F9FAFB", cursor: page === 1 ? "not-allowed" : "pointer" }}
                >
                  ← Anterior
                </button>
                <span style={{ padding: "6px 12px", fontSize: 12, color: "#9CA3AF" }}>
                  Pag. {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: page === totalPages ? "#4B5563" : "#F9FAFB", cursor: page === totalPages ? "not-allowed" : "pointer" }}
                >
                  Proxima →
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#374151" }}>
          Gastrointensivismo CRM © 2026 — Acesso restrito
        </p>
      </div>
    </div>
  );
}
