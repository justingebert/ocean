import React from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { CircleXIcon, LockKeyholeIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { CredentialProperties } from "../types/models";
import { UserValidation } from "../api/userClient";

export interface SignInFormProps {
  loading?: boolean;

  errorMessage?: string;

  onSubmit?: (credentials: CredentialProperties) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ loading, errorMessage, onSubmit }) => {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <Card>
        <CardContent className="flex flex-col gap-4">
          {errorMessage && (
            <Alert variant="destructive">
              <CircleXIcon aria-hidden="true" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
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
              onSubmit?.(values);
              setSubmitting(false);
            }}
          >
            {({ errors, touched, values, handleBlur, handleChange }) => {
              const usernameInvalid = Boolean(touched.username && errors.username);
              const passwordInvalid = Boolean(touched.password && errors.password);

              return (
                <Form>
                  <FieldGroup>
                    <Field data-invalid={usernameInvalid}>
                      <FieldLabel htmlFor="username">
                        Username<span aria-hidden="true">*</span>
                      </FieldLabel>
                      <Input
                        id="username"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="username"
                        aria-required="true"
                        aria-invalid={usernameInvalid}
                        aria-describedby={usernameInvalid ? "username-error" : undefined}
                      />
                      {usernameInvalid && (
                        <FieldError id="username-error">{errors.username}</FieldError>
                      )}
                    </Field>

                    <Field data-invalid={passwordInvalid}>
                      <FieldLabel htmlFor="password">
                        Password<span aria-hidden="true">*</span>
                      </FieldLabel>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="current-password"
                        aria-required="true"
                        aria-invalid={passwordInvalid}
                        aria-describedby={passwordInvalid ? "password-error" : undefined}
                      />
                      {passwordInvalid && (
                        <FieldError id="password-error">{errors.password}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <LockKeyholeIcon data-icon="inline-start" />
                        )}
                        {loading ? "Signing in..." : "Sign in"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </Form>
              );
            }}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;
