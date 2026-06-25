import { createContext, useContext } from "react";

import { CredentialProperties } from "../types/models";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
  status: AuthStatus;
  loginPending: boolean;
  loginError?: string;
  login: (credentials: CredentialProperties) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
