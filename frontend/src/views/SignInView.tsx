import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { OverviewNavigation } from "../constants/menu.ts";
import { CredentialProperties } from "../types/models";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { loginStart } from "../redux/slices/session/sessionSlice";

import SignInForm from "../components/SignInForm";

const SignInView: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, isLoggedIn } = useAppSelector((state) => state.session.session);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isLoggedIn === true) {
      navigate(OverviewNavigation.to);
    }
  }, [isLoggedIn, navigate]);

  const onSubmit = (credentials: CredentialProperties) => {
    dispatch(loginStart(credentials));
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your HTW account
        </h2>
      </div>
      <SignInForm loading={loading} errorMessage={error} onSubmit={onSubmit} />
    </div>
  );
};

export default SignInView;
