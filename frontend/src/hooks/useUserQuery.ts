import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { UserClient } from "../api/userClient";
import { UserProperties } from "../types/user";

/**
 * Custom hook to fetch a list of users.
 * Uses `react-query` to handle caching, background fetching, and API request state management.
 *
 * @param options - Optional query configuration (e.g., refetch intervals, stale time, caching behavior).
 * @returns A `useQuery` result containing an array of user properties.
 */
export const useUsersQuery = (
    options?: UseQueryOptions<ReadonlyArray<UserProperties>>
) => {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const data = await UserClient.getUsers();
            return data;
        },
        ...options,
    });
};
