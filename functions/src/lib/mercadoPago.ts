import { defineSecret } from "firebase-functions/params";
import { MercadoPagoConfig } from "mercadopago";

// SecretParam isn't exported from the public "firebase-functions/params" entry point,
// so ReturnType is the only portable way to name this type for declaration emit.
export const mpAccessToken: ReturnType<typeof defineSecret> = defineSecret("MP_ACCESS_TOKEN");

/** Secrets are only resolvable at invocation time, so build the client per-call, not at module load. */
export function getMpClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: mpAccessToken.value() });
}

/** Cloud Functions can't build a Firestore doc ref from an MP external_reference alone (needs tenantId too). */
export function encodeExternalReference(tenantId: string, orderId: string): string {
  return `${tenantId}:${orderId}`;
}

export function decodeExternalReference(externalReference: string): { tenantId: string; orderId: string } | null {
  const [tenantId, orderId] = externalReference.split(":");
  if (!tenantId || !orderId) return null;
  return { tenantId, orderId };
}
