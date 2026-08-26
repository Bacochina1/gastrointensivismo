import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gastrointensivismo | Medicina Intensiva sem complicação",
  description: "O treinamento definitivo para você alcançar a excelência na UTI. Coordenação clínica de intensivistas do HCFMUSP e Grupo MedCof.",
  metadataBase: new URL("https://gastrointensivismo.com.br"),
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Gastrointensivismo | Treinamento Oficial 2026",
    description: "Medicina Intensiva sem complicação com intensivistas do HCFMUSP. Inscreva-se com condição especial de lançamento.",
    url: "https://gastrointensivismo.com.br",
    siteName: "Gastrointensivismo",
    images: [
      {
        url: "/gastro-bg-1.png",
        width: 1200,
        height: 630,
        alt: "Gastrointensivismo Treinamento Oficial",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gastrointensivismo | Treinamento Oficial 2026",
    description: "Medicina Intensiva sem complicação com intensivistas do HCFMUSP.",
    images: ["/gastro-bg-1.png"],
  },
};

import { CookieBanner } from "@/components/CookieBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
      </head>
      <body
        className="bg-background font-body-md text-on-background tracking-tight"
      >
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
