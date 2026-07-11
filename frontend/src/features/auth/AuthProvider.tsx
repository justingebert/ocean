import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { setBearerToken, setupRequestInterceptors } from "@/api/client";
import { SessionClient } from "@/api/sessionClient";
import { UserClient } from "@/api/userClient";
import { CredentialProperties } from "@/api/sessionClient";
import { AuthContext, AuthStatus } from "./authContext";
import { clearStoredTokens, getStoredAccessToken, storeTokens } from "@/api/tokenStorage";

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
  const [initialAccessToken] = useState<string | null>(() => getStoredAccessToken());
  const [status, setStatus] = useState<AuthStatus>(() =>
    initialAccessToken ? "checking" : "unauthenticated",
  );
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
    return setupRequestInterceptors(
      (message) => {
        endSession(message);
      },
      () => SessionClient.renewAccessToken(),
    );
  }, [endSession]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!initialAccessToken) {
        return;
      }

      setBearerToken(initialAccessToken);

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
  }, [endSession, initialAccessToken, queryClient]);

  const login = useCallback(
    async (credentials: CredentialProperties) => {
      setLoginPending(true);
      setLoginError(undefined);

      try {
        const tokens = await SessionClient.login(credentials);
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
