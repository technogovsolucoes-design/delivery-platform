"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import type { Order } from "@delivery/shared-types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { formatCents } from "@/lib/format";
import { ORDER_STATUS_LABEL, canCancel, nextStatus } from "@/lib/order-status";
import { NoTenantNotice } from "@/components/no-tenant-notice";
import { StatusBadge } from "@/components/status-badge";

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
        <div className="page-header">
          <p className="eyebrow">Gestão</p>
          <h1>Pedidos</h1>
        </div>
        <NoTenantNotice />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Gestão</p>
        <h1>Pedidos</h1>
        <p>Fila de pedidos em tempo real.</p>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : orders.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🧾</div>
          <p style={{ margin: 0 }}>Nenhum pedido recebido ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => {
            const next = nextStatus(order.status);
            return (
              <div key={order.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <strong>Pedido #{order.id.slice(0, 8)}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <ul style={{ margin: "0 0 12px", paddingLeft: 18, color: "var(--muted)", fontSize: 14 }}>
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{formatCents(order.totalCents)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {next && (
                    <button type="button" className="btn-sm" onClick={() => updateStatus(order.id, next)}>
                      Avançar para &quot;{ORDER_STATUS_LABEL[next]}&quot;
                    </button>
                  )}
                  {canCancel(order.status) && (
                    <button
                      type="button"
                      className="btn-sm btn-danger"
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
