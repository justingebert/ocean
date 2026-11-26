import React, { useEffect } from "react";
import { type Location, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/authContext";
import { routePaths } from "@/app/navigation/routes.ts";
import { CredentialProperties } from "@/api/sessionClient";

import SignInForm from "@/features/auth/components/SignInForm";

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
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-foreground">
          Sign in to your HTW account
        </h2>
      </div>
      <SignInForm loading={loginPending} errorMessage={loginError} onSubmit={onSubmit} />
    </div>
  );
};

export default SignInRoute;
