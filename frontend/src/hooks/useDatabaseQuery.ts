import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

import { DatabaseClient } from "../api/databaseClient";
import { Database } from "../types/database";

/**
 * Custom hook to fetch all databases.
 * Uses `react-query` to cache and manage API requests efficiently.
 *
 * @param options - Optional query configuration.
 * @returns A `useQuery` result containing the databases.
 */
export const useDatabasesQuery = (
    options?: UseQueryOptions<ReadonlyArray<Database>>
) => {
    return useQuery({
        queryKey: ["databases", "_all_"], //
        queryFn: async () => {
            const data = await DatabaseClient.getAllDatabases();
            return data.map((database) => new Database(database));
        },
        ...options, //
    });
};

/**
 * Custom hook to delete a database with permission.
 * Uses `react-query` mutation to trigger a delete request.
 *
 * @param options - Optional mutation configuration.
 * @returns A `useMutation` result to handle the deletion process.
 */
export const useDeleteDatabaseWithPermissionMutation = (
    options?: Omit<UseMutationOptions<any, Error, number>, "mutationFn">
) => {
    return useMutation({
        mutationFn: async (variables: number) => {
            const { data } = await DatabaseClient.deleteDatabaseWithPermission(variables);
            return data;
        },
        ...options,
    });
};
