import * as yup from "yup";

import { RoleProperties, UpstreamCreateRoleProperties } from "../types/role";
import { axiosInstance } from "./client";

interface AvailabilityResponse {
  availability: boolean;
}

const existsRoleForDatabaseSchema: yup.ObjectSchema<AvailabilityResponse> = yup.object({
  availability: yup.boolean().required(),
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

    return existsRoleForDatabaseSchema.validateSync(data).availability;
  };

  public static deleteRoleForDatabase = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/roles/${id.toString()}`);
  };
}
