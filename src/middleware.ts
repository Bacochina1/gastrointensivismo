import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Intercepta e protege todas as rotas da Área do Aluno (/aluno e /aluno/*)
  if (pathname.startsWith("/aluno")) {
    const sessionCookie = req.cookies.get("gastro_session")?.value;

    if (!sessionCookie) {
      console.warn(`[Middleware Security] Acesso negado a ${pathname}: Cookie de sessão ausente.`);
      return NextResponse.redirect(new URL("/login?error=session_required", req.url));
    }

    const payload = await verifySessionToken(sessionCookie);

    if (!payload || !payload.hasAccess) {
      console.warn(`[Middleware Security] Acesso negado a ${pathname}: Sessão inválida ou sem assinatura ativa.`);
      return NextResponse.redirect(new URL("/login?error=access_denied", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/aluno/:path*", "/aluno"],
};
