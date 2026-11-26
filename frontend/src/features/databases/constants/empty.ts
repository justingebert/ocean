import { EmptyStateProps } from "@/components/common/EmptyState";

export const emptyDatabaseState: Pick<EmptyStateProps, "title" | "description" | "buttonText"> = {
  title: "No databases yet",
  description: "Create one to get a host, port and connection string.",
  buttonText: "New database",
};
