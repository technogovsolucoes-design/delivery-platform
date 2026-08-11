import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import type { AuthClaims } from "@delivery/shared-types";
import { auth } from "./firebase";

interface AuthState {
  user: User | null;
  claims: AuthClaims | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, claims: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, claims: null, loading: true });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, claims: null, loading: false });
        return;
      }
      const tokenResult = await user.getIdTokenResult();
      const claims: AuthClaims = {
        role: (tokenResult.claims.role as AuthClaims["role"]) ?? "customer",
        tenantId: (tokenResult.claims.tenantId as string | undefined) ?? null,
      };
      setState({ user, claims, loading: false });
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
