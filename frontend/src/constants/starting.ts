import { DatabaseIcon, LayersIcon, SettingsIcon } from "lucide-react";
import React from "react";

import { routePaths } from "../navigation/routes.ts";

export interface StartingPoint {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
}

export const startingPoints: StartingPoint[] = [
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
