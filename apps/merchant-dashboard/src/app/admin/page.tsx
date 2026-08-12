"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import type { Tenant } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { formatCents } from "@/lib/format";
import { CategoryTag } from "@/components/category-tag";

interface TenantSales {
  orderCount: number;
  revenueCents: number;
}

const STATUS_LABEL: Record<Tenant["status"], string> = {
  active: "Ativa",
  pending: "Pendente",
  suspended: "Suspensa",
};

const STATUS_CLASS: Record<Tenant["status"], string> = {
  active: "btn-success",
  pending: "btn-ghost",
  suspended: "btn-danger",
};

export default function AdminLojasPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [sales, setSales] = useState<Record<string, TenantSales>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(query(collection(db, "tenants")), (snapshot) => {
      setTenants(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Tenant));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tenants.length === 0) return;

    let cancelled = false;
    Promise.all(
      tenants.map(async (tenant) => {
        const ordersSnap = await getDocs(collection(db, "tenants", tenant.id, "orders"));
        let orderCount = 0;
        let revenueCents = 0;
        ordersSnap.forEach((orderDoc) => {
          const order = orderDoc.data();
          if (order.status === "delivered") {
            orderCount += 1;
            revenueCents += order.totalCents ?? 0;
          }
        });
        return [tenant.id, { orderCount, revenueCents }] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      setSales(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [tenants]);

  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Administração</p>
        <h1>Lojas</h1>
        <p>Todas as lojas cadastradas na plataforma, com vendas entregues.</p>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : tenants.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🏬</div>
          <p style={{ margin: 0 }}>Nenhuma loja cadastrada ainda.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Loja</th>
                <th>Proprietário</th>
                <th>Status</th>
                <th>Pedidos entregues</th>
                <th>Receita</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => {
                const tenantSales = sales[tenant.id];
                return (
                  <tr key={tenant.id}>
                    <td style={{ width: 56, paddingRight: 0 }}>
                      <CategoryTag category={tenant.category} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{tenant.name}</td>
                    <td style={{ color: "var(--muted)" }}>{tenant.owner?.email ?? "—"}</td>
                    <td>
                      <span className={`btn-sm ${STATUS_CLASS[tenant.status]}`} style={{ display: "inline-block", cursor: "default" }}>
                        {STATUS_LABEL[tenant.status]}
                      </span>
                    </td>
                    <td>{tenantSales ? tenantSales.orderCount : "…"}</td>
                    <td>{tenantSales ? formatCents(tenantSales.revenueCents) : "…"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
