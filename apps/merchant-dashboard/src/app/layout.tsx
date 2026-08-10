import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel do Lojista",
  description: "Gestão de estoque, pedidos e pagamentos",
};

// Every route here depends on client-side Firebase Auth state, so nothing here can be
// statically prerendered — doing so also made `next build` execute the Firebase client SDK
// at build time with no real project config, crashing with auth/invalid-api-key.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
