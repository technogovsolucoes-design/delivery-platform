"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import type { Order } from "@delivery/shared-types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { formatCents } from "@/lib/format";
import { ORDER_STATUS_LABEL, canCancel, nextStatus } from "@/lib/order-status";
import { NoTenantNotice } from "@/components/no-tenant-notice";

export default function PedidosPage() {
  const { claims } = useAuth();
  const tenantId = claims?.tenantId ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const ordersQuery = query(collection(db, "tenants", tenantId, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load orders", err);
        setLoading(false);
      }
    );
  }, [tenantId]);

  async function updateStatus(orderId: string, status: string) {
    if (!tenantId) return;
    await updateDoc(doc(db, "tenants", tenantId, "orders", orderId), {
      status,
      updatedAt: Date.now(),
    });
  }

  if (!tenantId) {
    return (
      <div>
        <h1>Pedidos</h1>
        <NoTenantNotice />
      </div>
    );
  }

  return (
    <div>
      <h1>Pedidos</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : orders.length === 0 ? (
        <p>Nenhum pedido recebido ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => {
            const next = nextStatus(order.status);
            return (
              <div key={order.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong>Pedido {order.id.slice(0, 8)}</strong>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>{ORDER_STATUS_LABEL[order.status]}</span>
                </div>
                <ul style={{ margin: "0 0 8px", paddingLeft: 18, color: "var(--muted)", fontSize: 14 }}>
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: 14, marginBottom: 12 }}>Total: {formatCents(order.totalCents)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {next && (
                    <button
                      type="button"
                      style={{ width: "auto", padding: "6px 14px" }}
                      onClick={() => updateStatus(order.id, next)}
                    >
                      Avançar para &quot;{ORDER_STATUS_LABEL[next]}&quot;
                    </button>
                  )}
                  {canCancel(order.status) && (
                    <button
                      type="button"
                      style={{ width: "auto", padding: "6px 14px", background: "#7a2e2e" }}
                      onClick={() => updateStatus(order.id, "cancelled")}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
