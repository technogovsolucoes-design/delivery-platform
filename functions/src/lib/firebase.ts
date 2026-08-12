import { initFirebaseAdmin } from "../../../packages/firebase-config/src/admin";
import type { Firestore } from "firebase-admin/firestore";

// Cloud Functions' deploy-time analysis step loads this module in a sandboxed process
// to enumerate exports; eagerly calling initializeApp() there stalls with
// "Cannot determine backend specification. Timeout after 10000." Deferring the call
// until a handler actually runs avoids that.
let cachedDb: Firestore | undefined;

export function getDb(): Firestore {
  if (!cachedDb) {
    cachedDb = initFirebaseAdmin().db;
  }
  return cachedDb;
}
