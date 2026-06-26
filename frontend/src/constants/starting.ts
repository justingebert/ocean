import { Cog8ToothIcon, CircleStackIcon } from "@heroicons/react/24/outline";
import React from "react";

import { routePaths } from "../navigation/routes.ts";

export interface StartingPoint {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
  background: string;
}

export const startingPoints: StartingPoint[] = [
  {
    title: "Create a Database",
    description: "Add a new database now.",
    icon: CircleStackIcon,
    to: routePaths.createDatabase,
    background: "bg-pink-500",
  },
  {
    title: "Manage Databases",
    description: "Manage databases in one place.",
    icon: CircleStackIcon,
    to: routePaths.databases,
    background: "bg-pink-500",
  },
  {
    title: "Manage your profile",
    description: "All your user-specific settings are located here.",
    icon: Cog8ToothIcon,
    to: routePaths.settings,
    background: "bg-yellow-500",
  },
];
