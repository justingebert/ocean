import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleXIcon, LockKeyholeIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { CredentialProperties } from "@/api/sessionClient";
import { loginSchema, type LoginValues } from "@/features/auth/validation";

export interface SignInFormProps {
  loading?: boolean;

  errorMessage?: string;

  onSubmit?: (credentials: CredentialProperties) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ loading, errorMessage, onSubmit }) => {
  const form = useForm<LoginValues>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <Card>
        <CardContent className="flex flex-col gap-4">
          {errorMessage && (
            <Alert variant="destructive">
              <CircleXIcon aria-hidden="true" />
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={form.handleSubmit((values) => onSubmit?.(values))}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="s0123456"
                      autoComplete="username"
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={fieldState.invalid ? "username-error" : undefined}
                    />
                    {fieldState.invalid && (
                      <FieldError id="username-error" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="current-password"
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={fieldState.invalid ? "password-error" : undefined}
                    />
                    {fieldState.invalid && (
                      <FieldError id="password-error" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;
