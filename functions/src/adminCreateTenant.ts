import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { StaffMember, Tenant, TenantAddress, TenantCategory, TenantOwner } from "../../packages/shared-types/src";
import { getAdminAuth, getDb } from "./lib/firebase";

interface AdminCreateTenantRequest {
  name: string;
  category: TenantCategory;
  commissionRate: number;
  logoUrl: string | null;
  address: TenantAddress;
  owner: TenantOwner;
}

interface AdminCreateTenantResponse {
  tenantId: string;
  ownerUid: string;
  /** Set only when a brand-new Auth account was created for the owner — relay it to them manually until email delivery is set up. */
  temporaryPassword: string | null;
}

function generateTemporaryPassword(): string {
  return `${Math.random().toString(36).slice(2, 10)}A1!`;
}

const DEFAULT_OPENING_HOURS: Tenant["openingHours"] = {
  mon: { open: "09:00", close: "22:00" },
  tue: { open: "09:00", close: "22:00" },
  wed: { open: "09:00", close: "22:00" },
  thu: { open: "09:00", close: "22:00" },
  fri: { open: "09:00", close: "23:00" },
  sat: { open: "09:00", close: "23:00" },
  sun: { open: "10:00", close: "20:00" },
};

export const adminCreateTenant = onCall<AdminCreateTenantRequest>({ invoker: "public" }, async (request) => {
  if (request.auth?.token.role !== "platform_admin") {
    throw new HttpsError("permission-denied", "Only platform admins can create stores.");
  }

  const { name, category, commissionRate, logoUrl, address, owner } = request.data;
  if (!name || !category || !owner?.email || !owner?.name) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const auth = getAdminAuth();
  const db = getDb();

  let ownerUid: string;
  let temporaryPassword: string | null = null;

  try {
    const existing = await auth.getUserByEmail(owner.email);
    ownerUid = existing.uid;
  } catch {
    temporaryPassword = generateTemporaryPassword();
    const created = await auth.createUser({
      email: owner.email,
      password: temporaryPassword,
      displayName: owner.name,
    });
    ownerUid = created.uid;
  }

  const tenantRef = db.collection("tenants").doc();
  const now = Date.now();
  const tenant: Omit<Tenant, "id"> = {
    name,
    category,
    status: "active",
    address,
    logoUrl,
    owner,
    commissionRate,
    mpSellerId: null,
    openingHours: DEFAULT_OPENING_HOURS,
    createdAt: now,
    updatedAt: now,
  };
  await tenantRef.set(tenant);

  await auth.setCustomUserClaims(ownerUid, { role: "merchant_owner", tenantId: tenantRef.id });

  const staffMember: StaffMember = {
    userId: ownerUid,
    tenantId: tenantRef.id,
    role: "owner",
    createdAt: now,
  };
  await db.doc(`tenants/${tenantRef.id}/staff/${ownerUid}`).set(staffMember);

  const response: AdminCreateTenantResponse = { tenantId: tenantRef.id, ownerUid, temporaryPassword };
  return response;
});
