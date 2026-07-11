import React from "react";
import {
  HomeIcon,
  CircleStackIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { routePaths } from "./routes.ts";

export type LinkProps = {
  name: string;
  to: string;
};

export type Navigation = LinkProps & {
  section: "primary" | "secondary";
  requiredPermission?: string;
  icon: React.ElementType;
};

export const OverviewNavigation: Navigation = {
  name: "Overview",
  to: routePaths.overview,
  section: "primary",
  icon: HomeIcon,
};

export const DatabasesNavigation: Navigation = {
  name: "Databases",
  to: routePaths.databases,
  section: "primary",
  icon: CircleStackIcon,
};

export const SettingsNavigation: Navigation = {
  name: "Settings",
  to: routePaths.settings,
  section: "secondary",
  icon: Cog8ToothIcon,
};

export const FAQNavigation: Navigation = {
  name: "FAQ",
  to: routePaths.faq,
  section: "secondary",
  icon: QuestionMarkCircleIcon,
};

export const ReportingNavigation: Navigation = {
  name: "Reporting",
  to: routePaths.reporting,
  section: "secondary",
  requiredPermission: "Staff",
  icon: ChartBarIcon,
};

export const navigation: Navigation[] = [
  OverviewNavigation,
  DatabasesNavigation,
  SettingsNavigation,
  ReportingNavigation,
  FAQNavigation,
];
