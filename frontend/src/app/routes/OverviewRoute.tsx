import React from "react";
import { DatabaseIcon, LayersIcon, SettingsIcon } from "lucide-react";

import { routePaths } from "@/app/navigation/routes";
import StartingPoints, { type StartingPoint } from "@/features/overview/StartingPoints";

const startingPoints: StartingPoint[] = [
  {
    title: "Create a database",
    description: "Spin up a new Postgres or MongoDB database.",
    icon: DatabaseIcon,
    to: routePaths.createDatabase,
  },
  {
    title: "Manage databases",
    description: "View, edit, and share the databases you own.",
    icon: LayersIcon,
    to: routePaths.databases,
  },
  {
    title: "Manage your profile",
    description: "Update your account settings and preferences.",
    icon: SettingsIcon,
    to: routePaths.settings,
  },
];

const OverviewRoute: React.FC = () => {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Provision and manage your databases in one place.
        </p>
      </header>
      <StartingPoints startingPoints={startingPoints} />
    </>
  );
};

export default OverviewRoute;
