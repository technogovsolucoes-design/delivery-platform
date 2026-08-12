import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Preference } from "mercadopago";
import type { Order, Tenant } from "../../packages/shared-types/src";
import { getDb } from "./lib/firebase";
import { getMpClient, mpAccessToken, encodeExternalReference } from "./lib/mercadoPago";

interface CreatePaymentPreferenceRequest {
  tenantId: string;
  orderId: string;
}

const CUSTOMER_WEB_URL = "https://delivery-customer-web-hazel.vercel.app";
const WEBHOOK_URL = "https://mpwebhook-jzzt2h3tsq-uc.a.run.app";

export const createPaymentPreference = onCall<CreatePaymentPreferenceRequest>(
  { secrets: [mpAccessToken] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login required.");
    }

    const db = getDb();
    const { tenantId, orderId } = request.data;
    const orderRef = db.doc(`tenants/${tenantId}/orders/${orderId}`);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }

    const order = orderSnap.data() as Order;
    if (order.customerId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "This order does not belong to you.");
    }

    const tenantSnap = await db.doc(`tenants/${tenantId}`).get();
    const tenant = tenantSnap.data() as Tenant | undefined;

    const preference = new Preference(getMpClient());
    const result = await preference.create({
      body: {
        items: order.items.map((item) => ({
          id: item.productId,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.unitPriceCents / 100,
          currency_id: "BRL",
        })),
        external_reference: encodeExternalReference(tenantId, orderId),
        marketplace_fee: order.payment.platformFeeCents / 100,
        // Split payment: requires the merchant to have completed Mercado Pago OAuth
        // (roadmap item — mpSellerId is null until then, so this falls back to a
        // regular, non-split preference on the platform's own MP account).
        ...(tenant?.mpSellerId ? { collector_id: Number(tenant.mpSellerId) } : {}),
        notification_url: WEBHOOK_URL,
        back_urls: {
          success: `${CUSTOMER_WEB_URL}/pedidos`,
          pending: `${CUSTOMER_WEB_URL}/pedidos`,
          failure: `${CUSTOMER_WEB_URL}/pedidos`,
        },
        auto_return: "approved",
      },
    });

    await orderRef.update({
      "payment.preferenceId": result.id ?? null,
      updatedAt: Date.now(),
    });

    return { preferenceId: result.id, initPoint: result.init_point };
  }
);
