import { z } from "zod";

import { RoleProperties, UpstreamCreateRoleProperties } from "@/features/databases/model/role";
import { axiosInstance } from "@/api/client";

interface AvailabilityResponse {
  availability: boolean;
}

const existsRoleForDatabaseSchema: z.ZodType<AvailabilityResponse> = z.object({
  availability: z.boolean(),
});

export class RoleClient {
  public static getRolesForDatabase = async (databaseId: number): Promise<RoleProperties[]> => {
    const { data } = await axiosInstance.get<RoleProperties[]>(
      `databases/${databaseId.toString()}/roles`,
    );
    return data;
  };

  public static createRoleForDatabase = async (
    role: UpstreamCreateRoleProperties,
  ): Promise<RoleProperties> => {
    const { data } = await axiosInstance.post<RoleProperties>("/roles", role);
    return data;
  };

  public static availabilityRoleForDatabase = async (
    role: UpstreamCreateRoleProperties,
  ): Promise<boolean> => {
    const { data } = await axiosInstance.post<AvailabilityResponse>("/roles/_availability_", role);

    return existsRoleForDatabaseSchema.parse(data).availability;
  };

  public static deleteRoleForDatabase = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/roles/${id.toString()}`);
  };
}
