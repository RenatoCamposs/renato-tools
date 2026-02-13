import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infinite Board - Your Visual Workspace",
  description: "Um board infinito estilo Miro com efeito de nuvem do Obsidian. Organize suas ideias visualmente com cards e pastas interativas.",
  keywords: ["board", "miro", "obsidian", "visual", "workspace", "cards", "organização"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={`${inter.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
