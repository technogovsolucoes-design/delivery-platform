import { initializeApp, getApps, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";

export interface FirebaseClientServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
}

/**
 * Each app (Next.js, Expo) reads its own env vars (different prefixes: NEXT_PUBLIC_*
 * vs EXPO_PUBLIC_*) and passes the resulting FirebaseOptions here, so this package
 * stays framework-agnostic.
 */
export function initFirebaseClient(options: FirebaseOptions): FirebaseClientServices {
  const app = getApps().length ? getApps()[0]! : initializeApp(options);
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
    functions: getFunctions(app),
  };
}

export type { FirebaseOptions };
