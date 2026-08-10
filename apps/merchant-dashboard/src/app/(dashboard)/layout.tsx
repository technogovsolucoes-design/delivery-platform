"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, claims, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="center-screen">Carregando...</div>;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <strong>{claims?.tenantId ?? "Minha loja"}</strong>
        <nav>
          <Link href="/estoque">Estoque</Link>
          <Link href="/pedidos">Pedidos</Link>
          <Link href="/pagamentos">Pagamentos</Link>
        </nav>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
