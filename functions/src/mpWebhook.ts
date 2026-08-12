import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { Payment } from "mercadopago";
import type { PaymentStatus } from "../../packages/shared-types/src";
import { getDb } from "./lib/firebase";
import { getMpClient, mpAccessToken, decodeExternalReference } from "./lib/mercadoPago";

function mapMpStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return "pending";
  }
}

export const mpWebhook = onRequest({ secrets: [mpAccessToken] }, async (req, res) => {
  const type = (req.query.type as string | undefined) ?? req.body?.type;
  const paymentId = (req.query["data.id"] as string | undefined) ?? req.body?.data?.id;

  if (type !== "payment" || !paymentId) {
    res.status(200).send("ignored");
    return;
  }

  const payment = new Payment(getMpClient());
  const paymentInfo = await payment.get({ id: String(paymentId) });

  const externalReference = paymentInfo.external_reference;
  const decoded = externalReference ? decodeExternalReference(externalReference) : null;
  if (!decoded) {
    logger.warn("mpWebhook: missing/invalid external_reference", { paymentId, externalReference });
    res.status(200).send("no order reference");
    return;
  }

  const paymentStatus = mapMpStatus(paymentInfo.status);
  const orderRef = getDb().doc(`tenants/${decoded.tenantId}/orders/${decoded.orderId}`);

  await orderRef.update({
    "payment.paymentId": String(paymentId),
    "payment.status": paymentStatus,
    status: paymentStatus === "approved" ? "confirmed" : paymentStatus === "rejected" ? "cancelled" : "pending_payment",
    updatedAt: Date.now(),
  });

  res.status(200).send("ok");
});
