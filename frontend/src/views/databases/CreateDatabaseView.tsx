import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpstreamDatabaseProperties } from "../../types/database";
import { DatabaseClient } from "../../api/databaseClient";
import { DatabasesNavigation } from "../../constants/menu.ts";
import AppLayout from "../../layouts/AppLayout";
import CreateDatabaseForm from "../../components/forms/CreateDatabaseForm";

/**
 * View component for creating a new database.
 * - Uses `react-query` to manage the mutation for database creation.
 * - Navigates to the database list upon successful creation.
 */
const CreateDatabaseView: React.FC = () => {
  const navigate = useNavigate();
  // Queries
  const queryClient = useQueryClient();
  /**
   * Mutation hook to create a new database.
   * - Calls `DatabaseClient.createDatabase()`.
   * - On success, invalidates the `databases` query and redirects the user.
   */
  const createDatabaseMutation = useMutation({
    mutationFn: (database: UpstreamDatabaseProperties) => DatabaseClient.createDatabase(database),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      navigate(DatabasesNavigation.to);
    },
  });

  return (
    <AppLayout selectedNavigation={DatabasesNavigation.name}>
      <CreateDatabaseForm
        processing={createDatabaseMutation.isPending}
        errorMessage={createDatabaseMutation.isError ? "Ein Fehler is aufgetreten" : undefined}
        onSubmit={(value) => createDatabaseMutation.mutate(value)}
      />
    </AppLayout>
  );
};

export default CreateDatabaseView;
