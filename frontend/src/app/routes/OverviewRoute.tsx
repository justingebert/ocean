import React from "react";
import { DatabaseIcon, LayersIcon, SettingsIcon } from "lucide-react";

import { routePaths } from "@/app/navigation/routes";
import { PageHeader } from "@/components/common/PageHeader";
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
      <PageHeader
        title="Overview"
        description="Provision and manage your databases in one place."
      />
      <StartingPoints startingPoints={startingPoints} />
    </>
  );
};

export default OverviewRoute;
