import React from "react";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { LockClosedIcon } from "@heroicons/react/20/solid";

import { Alert } from "./Feedback/Alert/Alert";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CredentialProperties } from "../types/models";
import { UserValidation } from "../api/userClient";

export interface SignInFormProps {
  loading?: boolean;

  errorMessage?: string;

  onSubmit?: (credentials: CredentialProperties) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ loading, errorMessage, onSubmit }) => {
  const getFieldClassNames = (hasError: boolean): string => {
    const common =
      "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm";
    if (hasError) {
      return `${common} border-red-600 focus:ring-red-600 focus:border-red-600`;
    } else {
      return `${common} border-gray-300 focus:ring-indigo-500 focus:border-indigo-500`;
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <Card className="py-8 px-4 sm:px-10">
        <div className="mb-4">
          {errorMessage && <Alert message={errorMessage} title="Error" variant="danger" />}
        </div>
        <Formik
          initialValues={{
            username: "",
            password: "",
          }}
          validationSchema={UserValidation.loginSchema}
          onSubmit={(
            values: CredentialProperties,
            { setSubmitting }: FormikHelpers<CredentialProperties>,
          ) => {
            if (onSubmit) {
              onSubmit(values);
            }
            setSubmitting(false);
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username*
                </label>
                <div className="mt-1">
                  <Field
                    id="username"
                    name="username"
                    placeholder=""
                    className={getFieldClassNames(
                      errors.username !== undefined && touched.username !== undefined,
                    )}
                  />
                  {errors.username && touched.username && (
                    <span className="mt-2 text-sm text-red-600" id="usernameHelp">
                      {errors.username}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password*
                </label>
                <div className="mt-1">
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder=""
                    className={getFieldClassNames(
                      errors.password !== undefined && touched.password !== undefined,
                    )}
                  />
                  {errors.password && touched.password && (
                    <span className="mt-2 text-sm text-red-600" id="passwordHelp">
                      {errors.password}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  </span>
                  Sign in
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default SignInForm;
