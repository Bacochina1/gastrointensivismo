"use client";

import { Sidebar } from "@/components/Sidebar";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; plan?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Validação de acesso client-side
    const storedUser = localStorage.getItem("gastro_user");
    if (!storedUser) {
      router.push("/login?error=auth_required");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (!parsed || !parsed.hasAccess) {
        router.push("/login?error=access_denied");
        return;
      }
      setUser({
        name: parsed.name || "Aluno Gastrointensivismo",
        email: parsed.email || "aluno@medcof.com.br",
        plan: parsed.plan || "regular",
      });
      setLoading(false);
    } catch {
      router.push("/login?error=invalid_session");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F6] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex selection:bg-primary/20 selection:text-primary">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <Suspense fallback={<div className="w-80 border-r border-[#EAE2E0] bg-white h-screen" />}>
          <Sidebar user={user || { name: 'Aluno Gastrointensivismo', email: 'aluno@medcof.com.br' }} />
        </Suspense>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          user={user || { name: 'Aluno Gastrointensivismo', email: 'aluno@medcof.com.br' }}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-[#EAE2E0] flex items-center justify-between px-4 sticky top-0 z-40">
          <img
            alt="Gastrointensivismo"
            className="h-8 w-auto object-contain"
            src="/logo.png"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#1A1C1C] p-2 rounded-xl hover:bg-[#FAF7F6] transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
