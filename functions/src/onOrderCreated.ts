import { onDocumentCreated } from "firebase-functions/v2/firestore";
import type { Transaction } from "firebase-admin/firestore";
import type { Order } from "../../packages/shared-types/src";
import { getDb } from "./lib/firebase";

export const onOrderCreated = onDocumentCreated(
  "tenants/{tenantId}/orders/{orderId}",
  async (event) => {
    const order = event.data?.data() as Order | undefined;
    const tenantId = event.params.tenantId;
    if (!order) return;

    const db = getDb();
    await db.runTransaction(async (tx: Transaction) => {
      for (const item of order.items) {
        const productRef = db.doc(`tenants/${tenantId}/products/${item.productId}`);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists) continue;

        const currentStock = (productSnap.data()?.stockQuantity as number | undefined) ?? 0;
        const nextStock = Math.max(0, currentStock - item.quantity);
        tx.update(productRef, { stockQuantity: nextStock, updatedAt: Date.now() });
      }
    });
  }
);
