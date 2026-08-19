"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/admin", label: "Lojas", icon: "🏬" },
  { href: "/admin/nova", label: "Nova loja", icon: "➕" },
  { href: "/admin/clientes", label: "Clientes", icon: "👤" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, claims, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (claims?.role !== "platform_admin") {
      router.replace("/pedidos");
    }
  }, [loading, user, claims, router]);

  if (loading || !user || claims?.role !== "platform_admin") {
    return <div className="center-screen">Carregando...</div>;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">🍹</div>
          <div>
            <div className="brand-name">Administração</div>
            <div className="brand-sub">Tião Beer Delivery</div>
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
