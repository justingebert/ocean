import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpstreamDatabaseProperties } from "@/features/databases/model/database";
import { DatabaseClient } from "@/features/databases/api/databaseClient";
import { routePaths } from "@/app/navigation/routes";
import CreateDatabaseForm from "@/features/databases/components/CreateDatabaseForm";

const CreateDatabaseRoute: React.FC = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const createDatabaseMutation = useMutation({
    mutationFn: (database: UpstreamDatabaseProperties) => DatabaseClient.createDatabase(database),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      navigate(routePaths.databases);
    },
  });

  return (
    <CreateDatabaseForm
      processing={createDatabaseMutation.isPending}
      errorMessage={createDatabaseMutation.isError ? "Ein Fehler is aufgetreten" : undefined}
      onSubmit={(value) => createDatabaseMutation.mutate(value)}
    />
  );
};

export default CreateDatabaseRoute;
