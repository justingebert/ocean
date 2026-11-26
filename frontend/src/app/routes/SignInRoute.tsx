import React, { useEffect } from "react";
import { type Location, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/authContext";
import { routePaths } from "@/app/navigation/routes.ts";
import { CredentialProperties } from "@/api/sessionClient";

import SignInForm from "@/features/auth/components/SignInForm";
import { OceanLogo } from "@/components/common/OceanLogo";

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
    <div className="flex min-h-svh flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
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
      <footer className="flex items-center justify-center gap-2 px-4 py-4 text-xs text-muted-foreground">
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
    </div>
  );
};

export default SignInRoute;
