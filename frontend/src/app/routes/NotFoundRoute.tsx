import React from "react";
import { Link } from "react-router-dom";
import { ShipWheel } from "lucide-react";

import { routePaths } from "@/app/navigation/routes.ts";
import { Button } from "@/components/ui/button";

const NotFoundRoute: React.FC = () => {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
        <ShipWheel className="size-8" aria-hidden="true" />
      </div>

      <div className="space-y-3">
        <p className="font-heading text-sm font-medium tracking-widest text-primary uppercase">
          Error 404
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          This page drifted off course
        </h1>
        <p className="mx-auto max-w-md text-pretty text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
      </div>

      <Button render={<Link to={routePaths.root} />} size="lg">
        Go back home
      </Button>
    </main>
  );
};

export default NotFoundRoute;
