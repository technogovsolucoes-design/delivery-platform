import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import type { Order } from "../../packages/shared-types/src";
import { getDb } from "./lib/firebase";
import { getResendClient, resendApiKey, EMAIL_FROM, formatCents } from "./lib/resend";

export const sendOrderReceiptEmail = onDocumentCreated(
  { document: "tenants/{tenantId}/orders/{orderId}", secrets: [resendApiKey] },
  async (event) => {
    const order = event.data?.data() as Order | undefined;
    if (!order) return;

    try {
      const userSnap = await getDb().doc(`users/${order.customerId}`).get();
      const email = userSnap.data()?.email as string | undefined;
      if (!email) return;

      const itemsHtml = order.items
        .map((item) => `<li>${item.quantity}x ${item.name} — ${formatCents(item.unitPriceCents * item.quantity)}</li>`)
        .join("");

      const resend = getResendClient();
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `Recibo do seu pedido #${event.params.orderId.slice(0, 8)}`,
        html: `
          <h2>Pedido confirmado!</h2>
          <ul>${itemsHtml}</ul>
          <p>Subtotal: ${formatCents(order.subtotalCents)}</p>
          <p>Entrega: ${formatCents(order.deliveryFeeCents)}</p>
          <p><strong>Total: ${formatCents(order.totalCents)}</strong></p>
          <p>Endereço de entrega: ${order.deliveryAddress.street}, ${order.deliveryAddress.number} — ${order.deliveryAddress.neighborhood}, ${order.deliveryAddress.city}/${order.deliveryAddress.state}</p>
        `,
      });
    } catch (error) {
      logger.error("sendOrderReceiptEmail: failed to send receipt email", {
        error,
        tenantId: event.params.tenantId,
        orderId: event.params.orderId,
      });
    }
  }
);
