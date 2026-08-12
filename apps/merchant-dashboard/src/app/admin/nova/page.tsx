"use client";

import { useState, type FormEvent } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { TenantAddress, TenantCategory } from "@delivery/shared-types";
import { db, functions, storage } from "@/lib/firebase";
import { formatCep, lookupCep } from "@/lib/cep";

interface AdminCreateTenantResponse {
  tenantId: string;
  ownerUid: string;
  temporaryPassword: string | null;
}

const CATEGORY_OPTIONS: { value: TenantCategory; label: string }[] = [
  { value: "bebidas", label: "Bebidas" },
  { value: "food", label: "Food" },
  { value: "mercado", label: "Mercado" },
  { value: "farmacia", label: "Farmácia" },
];

const EMPTY_ADDRESS: TenantAddress = {
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  lat: 0,
  lng: 0,
};

export default function NovaLojaPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TenantCategory>("bebidas");
  const [commissionPercent, setCommissionPercent] = useState("15");
  const [address, setAddress] = useState<TenantAddress>(EMPTY_ADDRESS);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [cepLooking, setCepLooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdminCreateTenantResponse | null>(null);

  function setAddressField<K extends keyof TenantAddress>(key: K, value: TenantAddress[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw);
    setAddressField("zipCode", formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLooking(true);
    try {
      const found = await lookupCep(digits);
      if (found) {
        setAddress((prev) => ({
          ...prev,
          zipCode: formatCep(found.cep),
          street: found.street,
          neighborhood: found.neighborhood,
          city: found.city,
          state: found.state,
        }));
      }
    } finally {
      setCepLooking(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const createTenant = httpsCallable<unknown, AdminCreateTenantResponse>(functions, "adminCreateTenant");
      const response = await createTenant({
        name,
        category,
        commissionRate: Number(commissionPercent) / 100,
        logoUrl: null,
        address,
        owner: { name: ownerName, email: ownerEmail, phone: ownerPhone },
      });

      let logoUrl: string | null = null;
      if (logoFile) {
        const logoRef = ref(storage, `tenants/${response.data.tenantId}/logo/${logoFile.name}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
        await updateDoc(doc(db, "tenants", response.data.tenantId), { logoUrl, updatedAt: Date.now() });
      }

      setResult(response.data);
    } catch (err) {
      console.error("Failed to create tenant", err);
      setError("Não foi possível criar a loja. Verifique os dados e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div>
        <div className="page-header">
          <p className="eyebrow">Administração</p>
          <h1>Loja criada!</h1>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <p>
            <strong>{name}</strong> foi cadastrada e já está ativa.
          </p>
          {result.temporaryPassword ? (
            <>
              <p>
                Uma conta nova foi criada para <strong>{ownerEmail}</strong>. Repasse a senha
                temporária abaixo para o lojista trocar no primeiro acesso:
              </p>
              <p style={{ fontFamily: "monospace", fontSize: 16, background: "var(--surface-raised)", padding: "8px 12px", borderRadius: 8 }}>
                {result.temporaryPassword}
              </p>
            </>
          ) : (
            <p>
              <strong>{ownerEmail}</strong> já tinha uma conta — ela foi vinculada a esta loja como
              proprietária.
            </p>
          )}
          <button
            type="button"
            className="btn-block"
            onClick={() => {
              setResult(null);
              setName("");
              setAddress(EMPTY_ADDRESS);
              setOwnerName("");
              setOwnerEmail("");
              setOwnerPhone("");
              setLogoFile(null);
            }}
          >
            Cadastrar outra loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Administração</p>
        <h1>Nova loja</h1>
        <p>Cadastro completo do estabelecimento e do proprietário.</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ marginBottom: 16 }}>Dados da loja</h2>
        <label htmlFor="name">Nome da loja</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TenantCategory)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                marginBottom: 12,
              }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="commission">Comissão da plataforma (%)</label>
            <input
              id="commission"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(e.target.value)}
              inputMode="decimal"
              required
            />
          </div>
        </div>

        <label htmlFor="logo">Logotipo (opcional)</label>
        <input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          style={{ marginBottom: 12 }}
        />

        <h2 style={{ margin: "20px 0 16px" }}>Endereço</h2>
        <label htmlFor="cep">CEP</label>
        <input id="cep" value={address.zipCode} onChange={(e) => handleCepChange(e.target.value)} maxLength={9} />
        {cepLooking && <p style={{ fontSize: 13, marginTop: -8 }}>Buscando endereço...</p>}

        <label htmlFor="street">Rua</label>
        <input id="street" value={address.street} onChange={(e) => setAddressField("street", e.target.value)} required />

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="number">Número</label>
            <input id="number" value={address.number} onChange={(e) => setAddressField("number", e.target.value)} required />
          </div>
          <div style={{ flex: 2 }}>
            <label htmlFor="neighborhood">Bairro</label>
            <input
              id="neighborhood"
              value={address.neighborhood}
              onChange={(e) => setAddressField("neighborhood", e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 2 }}>
            <label htmlFor="city">Cidade</label>
            <input id="city" value={address.city} onChange={(e) => setAddressField("city", e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="state">UF</label>
            <input
              id="state"
              value={address.state}
              maxLength={2}
              onChange={(e) => setAddressField("state", e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        <h2 style={{ margin: "20px 0 16px" }}>Proprietário</h2>
        <label htmlFor="ownerName">Nome completo</label>
        <input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
        <label htmlFor="ownerEmail">E-mail</label>
        <input
          id="ownerEmail"
          type="email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
        />
        <label htmlFor="ownerPhone">Telefone</label>
        <input id="ownerPhone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} required />

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 4 }}>{error}</p>}

        <button type="submit" className="btn-block" disabled={submitting} style={{ marginTop: 20 }}>
          {submitting ? "Criando..." : "Criar loja"}
        </button>
      </form>
    </div>
  );
}
