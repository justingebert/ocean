import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { OverviewNavigation } from "../constants/menu.ts";
import { CredentialProperties } from "../types/models";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { loginStart } from "../redux/slices/session/sessionSlice";

import UserLayout from "../layouts/UserLayout";
import SignInForm from "../components/SignInForm";

/**
 * The sign-in page where users can log into their HTW account.
 * - Uses `react-redux` for authentication state management.
 * - Redirects users to the overview page if they are already logged in.
 * - Handles authentication by dispatching login credentials to Redux.
 */
const SignInView: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, isLoggedIn } = useAppSelector((state) => state.session.session);
  const dispatch = useAppDispatch();
  /**
   * Redirects the user to the overview page if already logged in.
   * Runs on component mount and whenever `isLoggedIn` changes.
   */
  useEffect(() => {
    if (isLoggedIn === true) {
      // HINT: Already signed in
      navigate(OverviewNavigation.to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);
  /**
   * Handles form submission by dispatching login credentials.
   *
   * @param credentials - The user credentials (username and password).
   */
  const onSubmit = (credentials: CredentialProperties) => {
    dispatch(loginStart(credentials));
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your HTW account
          </h2>
        </div>
        <SignInForm loading={loading} errorMessage={error} onSubmit={onSubmit} />
      </div>
    </UserLayout>
  );
};

export default SignInView;
