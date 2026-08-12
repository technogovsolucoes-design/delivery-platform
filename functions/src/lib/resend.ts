import { defineSecret } from "firebase-functions/params";
import { Resend } from "resend";

// SecretParam isn't exported from the public "firebase-functions/params" entry point,
// so ReturnType is the only portable way to name this type for declaration emit.
export const resendApiKey: ReturnType<typeof defineSecret> = defineSecret("RESEND_API_KEY");

/** Secrets are only resolvable at invocation time, so build the client per-call, not at module load. */
export function getResendClient(): Resend {
  return new Resend(resendApiKey.value());
}

// TODO: swap for a verified sending domain in Resend once one is set up —
// onboarding@resend.dev can only deliver to the Resend account owner's own inbox.
export const EMAIL_FROM = "Tião Beer Delivery <onboarding@resend.dev>";

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
