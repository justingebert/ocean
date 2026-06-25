import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { UserClient } from "../api/userClient";
import { UserProperties } from "../types/user";

export const useUsersQuery = (options?: UseQueryOptions<ReadonlyArray<UserProperties>>) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await UserClient.getUsers();
      return data;
    },
    ...options,
  });
};
