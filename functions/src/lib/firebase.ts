import { initFirebaseAdmin } from "../../../packages/firebase-config/src/admin";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

// Cloud Functions' deploy-time analysis step loads this module in a sandboxed process
// to enumerate exports; eagerly calling initializeApp() there stalls with
// "Cannot determine backend specification. Timeout after 10000." Deferring the call
// until a handler actually runs avoids that.
let cachedServices: ReturnType<typeof initFirebaseAdmin> | undefined;

function getServices() {
  if (!cachedServices) {
    cachedServices = initFirebaseAdmin();
  }
  return cachedServices;
}

export function getDb(): Firestore {
  return getServices().db;
}

export function getAdminAuth(): Auth {
  return getServices().auth;
}
