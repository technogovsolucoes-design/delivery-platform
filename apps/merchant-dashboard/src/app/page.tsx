"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user, claims, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(claims?.role === "platform_admin" ? "/admin" : "/pedidos");
  }, [loading, user, claims, router]);

  return <div className="center-screen">Carregando...</div>;
}
