/**
 * One-off local script: creates a demo "bebidas" tenant with a few products, and
 * grants merchant_owner custom claims (+ tenantId) to an existing Firebase Auth user
 * so they can log into the merchant dashboard/app and see real data.
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS pointing at a service account key JSON
 * (Firebase Console -> Project settings -> Service accounts -> Generate new private key).
 *
 * Usage: SEED_MERCHANT_EMAIL=you@example.com pnpm seed
 */
import { initFirebaseAdmin } from "@delivery/firebase-config/admin";
import type { Product, Tenant } from "@delivery/shared-types";

const TENANT_ID = "demo-bebidas";

async function main() {
  const merchantEmail = process.env.SEED_MERCHANT_EMAIL;
  if (!merchantEmail) {
    console.error("Set SEED_MERCHANT_EMAIL to the email of the Firebase Auth user you created.");
    process.exit(1);
  }

  const { auth, db } = initFirebaseAdmin();

  const user = await auth.getUserByEmail(merchantEmail);

  const now = Date.now();
  const tenant: Tenant = {
    id: TENANT_ID,
    name: "Adega Boa Vista",
    category: "bebidas",
    status: "active",
    address: {
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
      lat: -23.5505,
      lng: -46.6333,
    },
    commissionRate: 0.15,
    mpSellerId: null,
    openingHours: {
      mon: { open: "10:00", close: "22:00" },
      tue: { open: "10:00", close: "22:00" },
      wed: { open: "10:00", close: "22:00" },
      thu: { open: "10:00", close: "22:00" },
      fri: { open: "10:00", close: "23:00" },
      sat: { open: "10:00", close: "23:00" },
      sun: { open: "12:00", close: "20:00" },
    },
    createdAt: now,
    updatedAt: now,
  };
  const { id: _tenantId, ...tenantData } = tenant;
  await db.doc(`tenants/${TENANT_ID}`).set(tenantData);

  const products: Array<Omit<Product, "id" | "tenantId">> = [
    { name: "Cerveja Pilsen 350ml", description: "", priceCents: 590, imageUrl: null, category: "cerveja", active: true, stockQuantity: 120, lowStockThreshold: 20, createdAt: now, updatedAt: now },
    { name: "Cerveja IPA 355ml", description: "", priceCents: 990, imageUrl: null, category: "cerveja", active: true, stockQuantity: 60, lowStockThreshold: 10, createdAt: now, updatedAt: now },
    { name: "Vinho Tinto Seco 750ml", description: "", priceCents: 3990, imageUrl: null, category: "vinho", active: true, stockQuantity: 24, lowStockThreshold: 5, createdAt: now, updatedAt: now },
    { name: "Água com Gás 500ml", description: "", priceCents: 350, imageUrl: null, category: "sem_alcool", active: true, stockQuantity: 200, lowStockThreshold: 30, createdAt: now, updatedAt: now },
    { name: "Gin 750ml", description: "", priceCents: 7990, imageUrl: null, category: "destilado", active: true, stockQuantity: 15, lowStockThreshold: 3, createdAt: now, updatedAt: now },
  ];

  const productsCollection = db.collection(`tenants/${TENANT_ID}/products`);
  for (const product of products) {
    await productsCollection.add({ ...product, tenantId: TENANT_ID });
  }

  await auth.setCustomUserClaims(user.uid, { role: "merchant_owner", tenantId: TENANT_ID });

  console.log(`Done. Tenant "${TENANT_ID}" created with ${products.length} products.`);
  console.log(`${merchantEmail} is now merchant_owner of "${TENANT_ID}".`);
  console.log("Sign out and back in on the dashboard/app for the new claims to take effect.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
