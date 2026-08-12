"use client";

import { useEffect, useState, type FormEvent } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import type { Product } from "@delivery/shared-types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { formatCents } from "@/lib/format";
import { NoTenantNotice } from "@/components/no-tenant-notice";
import { CategoryTag } from "@/components/category-tag";

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
        <div className="page-header">
          <p className="eyebrow">Gestão</p>
          <h1>Estoque</h1>
        </div>
        <NoTenantNotice />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Gestão</p>
        <h1>Estoque</h1>
        <p>Adicione produtos e mantenha a quantidade em estoque atualizada.</p>
      </div>

      <form onSubmit={handleAddProduct} className="card" style={{ maxWidth: 460, marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Novo produto</h2>
        <label htmlFor="p-name">Nome</label>
        <input id="p-name" placeholder="Ex: Cerveja Pilsen 350ml" value={name} onChange={(e) => setName(e.target.value)} required />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="p-price">Preço (R$)</label>
            <input id="p-price" placeholder="5,90" value={priceReais} onChange={(e) => setPriceReais(e.target.value)} inputMode="decimal" required />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="p-stock">Estoque inicial</label>
            <input id="p-stock" placeholder="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} inputMode="numeric" required />
          </div>
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: -4 }}>{error}</p>}
        <button type="submit" className="btn-block" disabled={submitting}>
          {submitting ? "Adicionando..." : "Adicionar produto"}
        </button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📦</div>
          <p style={{ margin: 0 }}>Nenhum produto cadastrado ainda.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Produto</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ width: 56, paddingRight: 0 }}>
                    <CategoryTag category={product.category} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{product.name}</td>
                  <td>{formatCents(product.priceCents)}</td>
                  <td>
                    <input
                      type="number"
                      value={product.stockQuantity}
                      onChange={(e) => handleStockChange(product.id, Number(e.target.value))}
                      style={{ width: 72, marginBottom: 0, padding: "6px 10px" }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(product)}
                      className={`btn-sm ${product.active ? "btn-success" : "btn-ghost"}`}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td>
                    <button type="button" onClick={() => handleDelete(product.id)} className="btn-sm btn-danger">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
