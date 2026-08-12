export type TenantCategory = "bebidas" | "food" | "mercado" | "farmacia";

export type TenantStatus = "pending" | "active" | "suspended";

export interface TenantAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export interface TenantOwner {
  name: string;
  email: string;
  phone: string;
}

export interface Tenant {
  id: string;
  name: string;
  category: TenantCategory;
  status: TenantStatus;
  address: TenantAddress;
  logoUrl: string | null;
  owner: TenantOwner;
  /** Platform commission rate applied on each order, e.g. 0.15 for 15%. */
  commissionRate: number;
  /** Connected Mercado Pago seller account id, used for split payments. Null until the merchant completes OAuth. */
  mpSellerId: string | null;
  openingHours: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    { open: string; close: string } | null
  >;
  createdAt: number;
  updatedAt: number;
}
