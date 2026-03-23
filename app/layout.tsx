import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamGen — Generador de Exámenes con IA",
  description: "Genera exámenes personalizados con inteligencia artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}