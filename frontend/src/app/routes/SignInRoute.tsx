import React, { useEffect } from "react";
import { type Location, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/authContext";
import { routePaths } from "@/app/navigation/routes.ts";
import { CredentialProperties } from "@/api/sessionClient";

import SignInForm from "@/features/auth/components/SignInForm";
import { OceanLogo } from "@/components/common/OceanLogo";

const SignInRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status, loginPending, loginError, login } = useAuth();

  // Set by ProtectedRoute when it sent the user here.
  const from = (location.state as { from?: Location } | null)?.from;
  const target = from ? `${from.pathname}${from.search}` : routePaths.databases;

  useEffect(() => {
    if (status === "authenticated") {
      void navigate(target, { replace: true });
    }
  }, [status, navigate, target]);

  const onSubmit = (credentials: CredentialProperties) => {
    void login(credentials);
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <OceanLogo className="size-10" alt="" />
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Sign in to Ocean
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Use your HTW account.</p>
          </div>
        </div>
        <SignInForm loading={loginPending} errorMessage={loginError} onSubmit={onSubmit} />
      </div>
    </main>
  );
};

export default SignInRoute;
