import { EmptyStateProps } from "../components/EmptyState";

export const emptyDatabaseState: Pick<EmptyStateProps, "title" | "description" | "buttonText"> = {
  title: "No databases",
  description: "Get started by creating a new database",
  buttonText: "New database",
};
