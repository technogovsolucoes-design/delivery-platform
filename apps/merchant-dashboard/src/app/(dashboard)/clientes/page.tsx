"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import type { Order } from "@delivery/shared-types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { formatCents } from "@/lib/format";
import { NoTenantNotice } from "@/components/no-tenant-notice";

interface CustomerSummary {
  customerId: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: number;
}

export default function ClientesPage() {
  const { claims } = useAuth();
  const tenantId = claims?.tenantId ?? null;
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    return onSnapshot(
      query(collection(db, "tenants", tenantId, "orders")),
      (snapshot) => {
        const byCustomer = new Map<string, CustomerSummary>();
        snapshot.forEach((docSnap) => {
          const order = docSnap.data() as Order;
          const existing = byCustomer.get(order.customerId);
          if (existing) {
            existing.orderCount += 1;
            existing.totalSpentCents += order.totalCents;
            existing.lastOrderAt = Math.max(existing.lastOrderAt, order.createdAt);
          } else {
            byCustomer.set(order.customerId, {
              customerId: order.customerId,
              name: order.customerName || "Cliente",
              email: order.customerEmail || "—",
              orderCount: 1,
              totalSpentCents: order.totalCents,
              lastOrderAt: order.createdAt,
            });
          }
        });
        setCustomers(Array.from(byCustomer.values()).sort((a, b) => b.lastOrderAt - a.lastOrderAt));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load customers", error);
        setLoading(false);
      }
    );
  }, [tenantId]);

  if (!tenantId) {
    return (
      <div>
        <div className="page-header">
          <p className="eyebrow">Gestão</p>
          <h1>Clientes</h1>
        </div>
        <NoTenantNotice />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Gestão</p>
        <h1>Clientes</h1>
        <p>Quem já comprou na sua loja.</p>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : customers.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👤</div>
          <p style={{ margin: 0 }}>Nenhum cliente ainda — assim que o primeiro pedido chegar, ele aparece aqui.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>E-mail</th>
                <th>Pedidos</th>
                <th>Total gasto</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId}>
                  <td style={{ fontWeight: 600 }}>{customer.name}</td>
                  <td style={{ color: "var(--muted)" }}>{customer.email}</td>
                  <td>{customer.orderCount}</td>
                  <td>{formatCents(customer.totalSpentCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
