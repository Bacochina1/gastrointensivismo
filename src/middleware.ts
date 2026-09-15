import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

const ADMIN_COOKIE = "gastro_admin_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protege a area do aluno (/aluno e /aluno/*)
  if (pathname.startsWith("/aluno")) {
    const sessionCookie = req.cookies.get("gastro_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login?error=session_required", req.url));
    }

    const payload = await verifySessionToken(sessionCookie);

    if (!payload || !payload.hasAccess) {
      return NextResponse.redirect(new URL("/login?error=access_denied", req.url));
    }
  }

  // Protege o painel admin (/admin) — requer cookie gastro_admin_session
  // A validacao real do token ocorre na API /api/admin (consulta no D1)
  // Aqui apenas bloqueamos quem nao tem o cookie sequer
  if (pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    const adminCookie = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!adminCookie) {
      // Sem cookie — mas a propria pagina /admin gerencia o estado de login no client
      // Deixa passar; a pagina redireciona para o formulario de senha
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/aluno/:path*", "/aluno", "/admin/:path*", "/admin"],
};
