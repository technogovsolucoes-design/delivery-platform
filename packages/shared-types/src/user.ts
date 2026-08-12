export type UserRole = "customer" | "merchant_owner" | "merchant_staff" | "platform_admin";

/** Mirrors the Firebase Auth custom claims set on the ID token. */
export interface AuthClaims {
  role: UserRole;
  tenantId: string | null;
}

export interface UserAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  address: UserAddress | null;
  createdAt: number;
  updatedAt: number;
}

export type StaffRole = "owner" | "staff";

export interface StaffMember {
  userId: string;
  tenantId: string;
  role: StaffRole;
  createdAt: number;
}
