import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { UserClient } from "@/api/userClient";
import { UserProperties } from "@/types/user";

export const useUsersQuery = (options?: UseQueryOptions<ReadonlyArray<UserProperties>>) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await UserClient.getUsers();
    },
    meta: { errorMessage: "Couldn't load users" },
    ...options,
  });
};
