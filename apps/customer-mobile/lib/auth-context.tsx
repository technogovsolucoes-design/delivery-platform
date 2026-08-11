import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "./firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true });

// No signup flow yet — anonymous auth just gives every customer a stable uid so
// orders can be tied to `customerId` per firestore.rules. Swap for real sign-in later.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({ user, loading: false });
        return;
      }
      signInAnonymously(auth).catch((error: unknown) => {
        console.error("Anonymous sign-in failed", error);
        setState({ user: null, loading: false });
      });
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
