"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import type { UserProfile } from "@delivery/shared-types";
import { db } from "@/lib/firebase";

export default function AdminClientesPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(query(collection(db, "users")), (snapshot) => {
      setCustomers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as UserProfile));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Administração</p>
        <h1>Clientes</h1>
        <p>Todos os clientes cadastrados na plataforma.</p>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : customers.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👤</div>
          <p style={{ margin: 0 }}>Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Cidade</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 600 }}>{customer.displayName || "—"}</td>
                  <td style={{ color: "var(--muted)" }}>{customer.email}</td>
                  <td style={{ color: "var(--muted)" }}>{customer.phone || "—"}</td>
                  <td style={{ color: "var(--muted)" }}>{customer.address?.city || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
