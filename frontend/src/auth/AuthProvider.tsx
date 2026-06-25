import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { setBearerToken, setupRequestInterceptors } from "../api/client";
import { SessionApi } from "../api/sessionApi";
import { UserClient } from "../api/userClient";
import { CredentialProperties } from "../types/models";
import { AuthContext, AuthStatus } from "./authContext";
import { clearStoredTokens, getStoredAccessToken, storeTokens } from "./tokenStorage";

type AuthProviderProps = {
  children: React.ReactNode;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Login failed.";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [loginPending, setLoginPending] = useState(false);
  const [loginError, setLoginError] = useState<string>();

  const endSession = useCallback(
    (message?: string) => {
      clearStoredTokens();
      setBearerToken("");
      queryClient.clear();
      setLoginError(message);
      setStatus("unauthenticated");
    },
    [queryClient],
  );

  useEffect(() => {
    return setupRequestInterceptors((message) => {
      endSession(message);
    });
  }, [endSession]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const accessToken = getStoredAccessToken();

      if (!accessToken) {
        if (!cancelled) {
          endSession();
        }
        return;
      }

      setBearerToken(accessToken);

      try {
        const user = await UserClient.getUser();
        if (!cancelled) {
          queryClient.setQueryData(["user"], user);
          setLoginError(undefined);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          endSession();
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [endSession, queryClient]);

  const login = useCallback(
    async (credentials: CredentialProperties) => {
      setLoginPending(true);
      setLoginError(undefined);

      try {
        const tokens = await SessionApi.login(credentials);
        storeTokens(tokens);
        setBearerToken(tokens.accessToken);
        queryClient.clear();
        setStatus("authenticated");
      } catch (error) {
        clearStoredTokens();
        setBearerToken("");
        setStatus("unauthenticated");
        setLoginError(getErrorMessage(error));
      } finally {
        setLoginPending(false);
      }
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    endSession();
  }, [endSession]);

  const value = useMemo(
    () => ({
      status,
      loginPending,
      loginError,
      login,
      logout,
    }),
    [status, loginPending, loginError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
