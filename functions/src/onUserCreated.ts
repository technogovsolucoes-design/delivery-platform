import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import type { UserProfile } from "../../packages/shared-types/src";
import { getResendClient, resendApiKey, EMAIL_FROM } from "./lib/resend";

export const onUserCreated = onDocumentCreated(
  { document: "users/{userId}", secrets: [resendApiKey] },
  async (event) => {
    const profile = event.data?.data() as UserProfile | undefined;
    if (!profile?.email) return;

    try {
      const resend = getResendClient();
      await resend.emails.send({
        from: EMAIL_FROM,
        to: profile.email,
        subject: "Bem-vindo ao Tião Beer Delivery!",
        html: `
          <p>Olá, ${profile.displayName}!</p>
          <p>Sua conta foi criada com sucesso. Agora é só escolher sua loja favorita e pedir suas bebidas.</p>
          <p>— Equipe Tião Beer Delivery</p>
        `,
      });
    } catch (error) {
      logger.error("onUserCreated: failed to send welcome email", { error, userId: event.params.userId });
    }
  }
);
