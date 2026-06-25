import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/authContext";
import { OverviewNavigation } from "../constants/menu.ts";
import { CredentialProperties } from "../types/models";

import SignInForm from "../components/SignInForm";

const SignInView: React.FC = () => {
  const navigate = useNavigate();
  const { status, loginPending, loginError, login } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      navigate(OverviewNavigation.to, { replace: true });
    }
  }, [status, navigate]);

  const onSubmit = (credentials: CredentialProperties) => {
    void login(credentials);
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your HTW account
        </h2>
      </div>
      <SignInForm loading={loginPending} errorMessage={loginError} onSubmit={onSubmit} />
    </div>
  );
};

export default SignInView;
