import React from "react";
import {
  HomeIcon,
  CircleStackIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// TODO: create a map for all routes
/**
 * Represents the basic properties of a navigation link.
 */
export type LinkProps = {
  /** Display name of the navigation link. */
  name: string;
  /** Route path for navigation. */
  to: string;
};
/**
 * Extended navigation properties including section, permissions, and icon.
 */
export type Navigation = LinkProps & {
  /** Section where the navigation link belongs (`primary` or `secondary`). */
  section: "primary" | "secondary";
  /** (Optional) Permission required to access this navigation link. */
  requiredPermission?: string;
  /** React component representing the navigation icon. */
  icon: React.ElementType;
};
/**
 * Navigation link for the overview page.
 */
export const OverviewNavigation: Navigation = {
  name: "Overview",
  to: "/overview",
  section: "primary",
  icon: HomeIcon,
};
/**
 * Navigation link for the databases page.
 */
export const DatabasesNavigation: Navigation = {
  name: "Databases",
  to: "/databases",
  section: "primary",
  icon: CircleStackIcon,
};
/**
 * Navigation link for the settings page.
 */
export const SettingsNavigation: Navigation = {
  name: "Settings",
  to: "/settings",
  section: "secondary",
  icon: Cog8ToothIcon,
};
/**
 * Navigation link for the FAQ page.
 */
export const FAQNavigation: Navigation = {
  name: "FAQ",
  to: "/faq",
  section: "secondary",
  icon: QuestionMarkCircleIcon,
};
/**
 * Navigation link for the reporting page (Requires "Staff" permission).
 */
export const ReportingNavigation: Navigation = {
  name: "Reporting",
  to: "/reporting",
  section: "secondary",
  requiredPermission: "Staff",
  icon: ChartBarIcon,
};

// HINT: INSERT NEW NAVIGATION HERE

/**
 * Aggregated list of all navigation links.
 */
export const navigation = [
  OverviewNavigation,
  DatabasesNavigation,
  SettingsNavigation,
  ReportingNavigation,
  FAQNavigation,
];
