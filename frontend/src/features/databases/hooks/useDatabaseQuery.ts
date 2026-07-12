import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";

import { DatabaseClient } from "@/features/databases/api/databaseClient";
import { Database } from "@/features/databases/model/database";

export const useDatabasesQuery = (options?: UseQueryOptions<ReadonlyArray<Database>>) => {
  return useQuery({
    queryKey: ["databases", "_all_"],
    queryFn: async () => {
      const data = await DatabaseClient.getAllDatabases();
      return data.map((database) => new Database(database));
    },
    meta: { errorMessage: "Couldn't load databases" },
    ...options,
  });
};

export const useDeleteDatabaseWithPermissionMutation = (
  options?: Omit<UseMutationOptions<void, Error, number>, "mutationFn">,
) => {
  return useMutation({
    mutationFn: async (variables: number) => {
      return DatabaseClient.deleteDatabaseWithPermission(variables);
    },
    ...options,
  });
};
