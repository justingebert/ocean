import { EmptyStateProps } from "../components/EmptyState";

/**
 * Default empty state configuration for when no databases are available.
 * This object provides title, description, and button text for UI rendering.
 */
export const emptyDatabaseState: Pick<
  EmptyStateProps,
  "title" | "description" | "buttonText"
> = {
  title: "No databases",
  description: "Get started by creating a new database",
  buttonText: "New database",
};
