"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Tenant, TenantAddress, TenantCategory, TenantStatus } from "@delivery/shared-types";
import { db, storage } from "@/lib/firebase";
import { formatCep, lookupCep } from "@/lib/cep";

const CATEGORY_OPTIONS: { value: TenantCategory; label: string }[] = [
  { value: "bebidas", label: "Bebidas" },
  { value: "food", label: "Food" },
  { value: "mercado", label: "Mercado" },
  { value: "farmacia", label: "Farmácia" },
];

const STATUS_OPTIONS: { value: TenantStatus; label: string }[] = [
  { value: "active", label: "Ativa" },
  { value: "pending", label: "Pendente" },
  { value: "suspended", label: "Suspensa" },
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

const selectStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  marginBottom: 12,
} as const;

export default function EditarLojaPage() {
  const params = useParams<{ tenantId: string }>();
  const router = useRouter();
  const tenantId = params.tenantId;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TenantCategory>("bebidas");
  const [status, setStatus] = useState<TenantStatus>("active");
  const [commissionPercent, setCommissionPercent] = useState("15");
  const [address, setAddress] = useState<TenantAddress>(EMPTY_ADDRESS);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [cepLooking, setCepLooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "tenants", tenantId)).then((snap) => {
      const tenant = snap.data() as Tenant | undefined;
      if (tenant) {
        setName(tenant.name);
        setCategory(tenant.category);
        setStatus(tenant.status);
        setCommissionPercent(String(Math.round(tenant.commissionRate * 100)));
        setAddress(tenant.address);
        setOwnerName(tenant.owner?.name ?? "");
        setOwnerEmail(tenant.owner?.email ?? "");
        setOwnerPhone(tenant.owner?.phone ?? "");
        setLogoUrl(tenant.logoUrl);
      }
      setLoading(false);
    });
  }, [tenantId]);

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
      let nextLogoUrl = logoUrl;
      if (logoFile) {
        const logoRef = ref(storage, `tenants/${tenantId}/logo/${logoFile.name}`);
        await uploadBytes(logoRef, logoFile);
        nextLogoUrl = await getDownloadURL(logoRef);
      }

      await updateDoc(doc(db, "tenants", tenantId), {
        name,
        category,
        status,
        commissionRate: Number(commissionPercent) / 100,
        address,
        logoUrl: nextLogoUrl,
        owner: { name: ownerName, email: ownerEmail, phone: ownerPhone },
        updatedAt: Date.now(),
      });

      setLogoUrl(nextLogoUrl);
      setLogoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to update tenant", err);
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <p className="eyebrow">Administração</p>
          <h1>Editar loja</h1>
        </div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <button type="button" className="btn-sm btn-ghost" onClick={() => router.push("/admin")} style={{ marginBottom: 12 }}>
          ‹ Voltar
        </button>
        <p className="eyebrow">Administração</p>
        <h1>Editar loja</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ marginBottom: 16 }}>Dados da loja</h2>
        <label htmlFor="name">Nome da loja</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="category">Categoria</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value as TenantCategory)} style={selectStyle}>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TenantStatus)} style={selectStyle}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="commission">Comissão da plataforma (%)</label>
        <input id="commission" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} inputMode="decimal" required />

        {logoUrl && !logoFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo atual" style={{ width: 64, height: 64, borderRadius: 8, marginBottom: 8, objectFit: "cover" }} />
        )}
        <label htmlFor="logo">{logoUrl ? "Trocar logotipo" : "Logotipo (opcional)"}</label>
        <input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} style={{ marginBottom: 12 }} />

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
        <label htmlFor="ownerEmail">E-mail (login)</label>
        <input id="ownerEmail" type="email" value={ownerEmail} disabled style={{ opacity: 0.6 }} />
        <p style={{ fontSize: 12, marginTop: -8, marginBottom: 12 }}>
          Trocar o e-mail de login do proprietário não é suportado por aqui ainda.
        </p>
        <label htmlFor="ownerPhone">Telefone</label>
        <input id="ownerPhone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} required />

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 4 }}>{error}</p>}
        {saved && <p style={{ color: "var(--success)", fontSize: 13, marginTop: 4 }}>Salvo!</p>}

        <button type="submit" className="btn-block" disabled={submitting} style={{ marginTop: 20 }}>
          {submitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
