import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const requestedName = searchParams.get("name") || searchParams.get("filename");

    if (!targetUrl) {
      return NextResponse.json({ error: "Parâmetro url é obrigatório" }, { status: 400 });
    }

    let resolvedUrl: string;
    if (targetUrl.startsWith("/")) {
      const origin = new URL(request.url).origin;
      resolvedUrl = `${origin}${targetUrl}`;
    } else {
      try {
        const parsed = new URL(targetUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          return NextResponse.json({ error: "Protocolo inválido" }, { status: 400 });
        }
        resolvedUrl = targetUrl;
      } catch {
        return NextResponse.json({ error: "URL inválida" }, { status: 400 });
      }
    }

    let filename = requestedName ? requestedName.trim() : "";
    if (!filename) {
      try {
        const u = new URL(resolvedUrl);
        const segments = u.pathname.split("/").filter(Boolean);
        filename = segments[segments.length - 1] || "documento.pdf";
      } catch {
        filename = "documento.pdf";
      }
    }

    if (!filename.toLowerCase().endsWith(".pdf")) {
      filename += ".pdf";
    }

    const cleanAsciiName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const upstreamRes = await fetch(resolvedUrl, {
      headers: {
        Accept: "application/pdf,*/*",
        "User-Agent": "Mozilla/5.0 (compatible; GastrointensivismoProxy/1.0)",
      },
    });

    if (!upstreamRes.ok) {
      console.error(`[DownloadProxy] Falha ao buscar ${resolvedUrl}: ${upstreamRes.status}`);
      return NextResponse.redirect(resolvedUrl);
    }

    const contentType = upstreamRes.headers.get("content-type") || "application/pdf";
    const arrayBuffer = await upstreamRes.arrayBuffer();

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${cleanAsciiName}"`);
    headers.set("Content-Length", String(arrayBuffer.byteLength));
    headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");

    return new Response(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[DownloadProxy] Erro ao processar download:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar o download do arquivo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
