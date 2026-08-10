import { initFirebaseClient } from "@delivery/firebase-config";

// NOTE: getAuth() without React Native persistence loses auth state on app restart.
// Follow-up: switch to initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
// once the login flow is implemented.
export const { app, auth, db, storage } = initFirebaseClient({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
});
