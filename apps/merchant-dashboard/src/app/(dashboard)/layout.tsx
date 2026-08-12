"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/estoque", label: "Estoque", icon: "📦" },
  { href: "/pedidos", label: "Pedidos", icon: "🧾" },
  { href: "/pagamentos", label: "Pagamentos", icon: "💳" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, claims, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
        <div className="brand">
          <div className="brand-mark">🍹</div>
          <div>
            <div className="brand-name">{claims?.tenantId ?? "Minha loja"}</div>
            <div className="brand-sub">Painel do lojista</div>
          </div>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
