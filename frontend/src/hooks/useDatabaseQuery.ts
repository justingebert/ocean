import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";

import { DatabaseClient } from "../api/databaseClient";
import { Database } from "../types/database";

export const useDatabasesQuery = (options?: UseQueryOptions<ReadonlyArray<Database>>) => {
  return useQuery({
    queryKey: ["databases", "_all_"],
    queryFn: async () => {
      const data = await DatabaseClient.getAllDatabases();
      return data.map((database) => new Database(database));
    },
    ...options,
  });
};

export const useDeleteDatabaseWithPermissionMutation = (
  options?: Omit<UseMutationOptions<unknown, Error, number>, "mutationFn">,
) => {
  return useMutation({
    mutationFn: async (variables: number) => {
      return DatabaseClient.deleteDatabaseWithPermission(variables);
    },
    ...options,
  });
};
