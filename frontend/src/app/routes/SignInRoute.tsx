import React, { useEffect } from "react";
import { type Location, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/authContext";
import { routePaths } from "@/app/navigation/routes.ts";
import { CredentialProperties } from "@/api/sessionClient";

import SignInForm from "@/features/auth/components/SignInForm";
import { OceanGraphic } from "@/features/auth/components/OceanGraphic";
import { OceanLogo } from "@/components/common/OceanLogo";
import { Card, CardContent } from "@/components/ui/card";

const legalLinks = [
  { label: "Legal notice", href: "https://www.htw-berlin.de/impressum/" },
  { label: "Privacy policy", href: "https://www.htw-berlin.de/datenschutz/" },
];

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
    <div className="flex min-h-svh flex-col bg-muted">
      <header className="px-6 pt-6 md:px-10 md:pt-8">
        <a
          href="https://www.htw-berlin.de/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {/* Black text and HTW green; shown all white in dark mode so the text stays readable. */}
          <img
            src="/htw-logo.svg"
            alt="HTW Berlin"
            className="h-12 w-auto md:h-16 dark:brightness-0 dark:invert"
          />
        </a>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
        <Card className="w-full max-w-sm p-0 md:max-w-4xl">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-6 p-6 md:p-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <OceanLogo className="size-10" alt="" />
                <div>
                  <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                    Sign in to Ocean
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">Use your HTW account.</p>
                </div>
              </div>
              <SignInForm loading={loginPending} errorMessage={loginError} onSubmit={onSubmit} />
            </div>
            <div className="relative hidden min-h-[28rem] md:block">
              <OceanGraphic className="absolute inset-0" />
            </div>
          </CardContent>
        </Card>
        <footer className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {legalLinks.map((link, index) => (
            <React.Fragment key={link.href}>
              {index > 0 && <span aria-hidden="true">·</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xs underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground"
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </footer>
      </main>
    </div>
  );
};

export default SignInRoute;
