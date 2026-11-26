import { CircleHelpIcon, DatabaseIcon, ShieldCheckIcon, type LucideIcon } from "lucide-react";

import { routePaths } from "./routes.ts";

export type LinkProps = {
  name: string;
  to: string;
};

export type Navigation = LinkProps & {
  section: "primary" | "secondary";
  requiredPermission?: string;
  icon: LucideIcon;
};

export const DatabasesNavigation: Navigation = {
  name: "Databases",
  to: routePaths.databases,
  section: "primary",
  icon: DatabaseIcon,
};

export const HelpNavigation: Navigation = {
  name: "Help",
  to: routePaths.faq,
  section: "secondary",
  icon: CircleHelpIcon,
};

export const AdministrationNavigation: Navigation = {
  name: "Administration",
  to: routePaths.reporting,
  section: "secondary",
  requiredPermission: "Staff",
  icon: ShieldCheckIcon,
};

export const navigation: Navigation[] = [
  DatabasesNavigation,
  AdministrationNavigation,
  HelpNavigation,
];
