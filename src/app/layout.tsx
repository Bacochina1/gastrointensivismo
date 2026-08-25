import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gastrointensivismo",
  description: "Treinamento ideal para alcançar a excelência na UTI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
      </head>
      <body
        className="bg-background font-body-md text-on-background tracking-tight"
      >
        {children}
      </body>
    </html>
  );
}
