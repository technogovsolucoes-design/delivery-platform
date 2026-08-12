/**
 * One-off local script: grants platform_admin custom claims to an existing Firebase
 * Auth user, so they can log into the merchant dashboard's /admin area.
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS pointing at a service account key JSON.
 *
 * Usage: ADMIN_EMAIL=you@example.com pnpm make-admin
 */
import { initFirebaseAdmin } from "@delivery/firebase-config/admin";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("Set ADMIN_EMAIL to the email of the Firebase Auth user to promote.");
    process.exit(1);
  }

  const { auth, db } = initFirebaseAdmin();

  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { role: "platform_admin", tenantId: null });
  await db.doc(`platformAdmins/${user.uid}`).set({ email, createdAt: Date.now() });

  console.log(`${email} is now a platform_admin.`);
  console.log("Sign out and back in on the dashboard for the new claims to take effect.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
