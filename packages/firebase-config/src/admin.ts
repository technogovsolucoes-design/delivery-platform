import { initializeApp, getApps, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

export interface FirebaseAdminServices {
  app: App;
  auth: Auth;
  db: Firestore;
  storage: Storage;
}

/**
 * No-arg initializeApp() picks up the runtime service account automatically inside
 * Cloud Functions / Cloud Run. For local scripts, set GOOGLE_APPLICATION_CREDENTIALS.
 */
export function initFirebaseAdmin(): FirebaseAdminServices {
  const app = getApps().length ? getApps()[0]! : initializeApp();
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
}
