"use client";

import { useEffect, useState, type FormEvent } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import type { Product } from "@delivery/shared-types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { formatCents } from "@/lib/format";
import { NoTenantNotice } from "@/components/no-tenant-notice";

export default function EstoquePage() {
  const { claims } = useAuth();
  const tenantId = claims?.tenantId ?? null;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [priceReais, setPriceReais] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const productsQuery = query(collection(db, "tenants", tenantId, "products"), orderBy("name"));
    return onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load products", err);
        setLoading(false);
      }
    );
  }, [tenantId]);

  async function handleAddProduct(e: FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setError(null);
    setSubmitting(true);
    try {
      const now = Date.now();
      const priceCents = Math.round(Number(priceReais.replace(",", ".")) * 100);
      const product: Omit<Product, "id"> = {
        tenantId,
        name,
        description: "",
        priceCents: Number.isFinite(priceCents) ? priceCents : 0,
        imageUrl: null,
        category: "geral",
        active: true,
        stockQuantity: Number(stockQuantity) || 0,
        lowStockThreshold: 5,
        createdAt: now,
        updatedAt: now,
      };
      await addDoc(collection(db, "tenants", tenantId, "products"), product);
      setName("");
      setPriceReais("");
      setStockQuantity("");
    } catch (err) {
      console.error("Failed to add product", err);
      setError("Não foi possível adicionar o produto.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStockChange(productId: string, stockQuantity: number) {
    if (!tenantId) return;
    await updateDoc(doc(db, "tenants", tenantId, "products", productId), {
      stockQuantity: Math.max(0, stockQuantity),
      updatedAt: Date.now(),
    });
  }

  async function handleToggleActive(product: Product) {
    if (!tenantId) return;
    await updateDoc(doc(db, "tenants", tenantId, "products", product.id), {
      active: !product.active,
      updatedAt: Date.now(),
    });
  }

  async function handleDelete(productId: string) {
    if (!tenantId) return;
    await deleteDoc(doc(db, "tenants", tenantId, "products", productId));
  }

  if (!tenantId) {
    return (
      <div>
        <h1>Estoque</h1>
        <NoTenantNotice />
      </div>
    );
  }

  return (
    <div>
      <h1>Estoque</h1>

      <form onSubmit={handleAddProduct} className="card" style={{ maxWidth: 480, marginBottom: 24 }}>
        <input placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="Preço (R$)"
          value={priceReais}
          onChange={(e) => setPriceReais(e.target.value)}
          inputMode="decimal"
          required
        />
        <input
          placeholder="Estoque inicial"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          inputMode="numeric"
          required
        />
        {error && <p style={{ color: "#ff6b6b", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Adicionando..." : "Adicionar produto"}
        </button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto cadastrado ainda.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 13 }}>
              <th style={{ padding: "8px 0" }}>Produto</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 0" }}>{product.name}</td>
                <td>{formatCents(product.priceCents)}</td>
                <td>
                  <input
                    type="number"
                    value={product.stockQuantity}
                    onChange={(e) => handleStockChange(product.id, Number(e.target.value))}
                    style={{ width: 72, marginBottom: 0, padding: "4px 8px" }}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(product)}
                    style={{ width: "auto", padding: "4px 10px", background: product.active ? "#2e7d4f" : "#4a4f57" }}
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    style={{ width: "auto", padding: "4px 10px", background: "#7a2e2e" }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
