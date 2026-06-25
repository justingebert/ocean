import * as yup from "yup";

import { RoleProperties, UpstreamCreateRoleProperties } from "../types/role";
import { axiosInstance } from "./client";

interface AvailabilityResponse {
  availability: boolean;
}

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

  public static availabilityRoleForDatabase = (role: UpstreamCreateRoleProperties) =>
    axiosInstance.post<AvailabilityResponse>("/roles/_availability_", role);

  public static deleteRoleForDatabase = async (id: number) => {
    const { data } = await axiosInstance.delete<unknown>(`/roles/${id.toString()}`);
    return data;
  };
}

export class RoleValidation {
  public static existsRoleForDatabaseSchema = yup.object().shape({
    availability: yup.boolean().required(),
  });
}
