import * as yup from "yup";

import { RoleProperties, UpstreamCreateRoleProperties } from "../types/role";
import { axiosInstance } from "./client";

export class RoleClient {
  /**
   * Fetches all roles associated with a specific database.
   * @param databaseId - The unique identifier of the database.
   * @returns A promise that resolves to an array of role properties.
   */
  public static getRolesForDatabase = async (
    databaseId: number
  ): Promise<RoleProperties[]> => {
    const { data } = await axiosInstance.get<RoleProperties[]>(
      `databases/${databaseId.toString()}/roles`
    );
    return data;
  };

  /**
   * Creates a new role for a specified database.
   * @param role - The properties of the role to create.
   * @returns A promise that resolves to the created role properties.
   */
  public static createRoleForDatabase = async (
    role: UpstreamCreateRoleProperties
  ): Promise<RoleProperties> => {
    const { data } = await axiosInstance.post<RoleProperties>("/roles", role);
    return data;
  };

  /**
   * Checks if a specific role already exists for a database.
   * @param role - The role properties to check for availability.
   * @returns A promise that resolves with the availability status.
   */
  public static availabilityRoleForDatabase = (
    role: UpstreamCreateRoleProperties
  ) => axiosInstance.post<any>("/roles/_availability_", role);

  /**
   * Deletes a role by its unique ID.
   * @param id - The unique identifier of the role to delete.
   * @returns A promise that resolves to a deletion response.
   */
  public static deleteRoleForDatabase = async (id: number) => {
    const { data } = await axiosInstance.delete<any>(`/roles/${id.toString()}`);
    return data;
  };
}

export class RoleValidation {
  /**
   * Schema for validating role existence check response.
   * Ensures the response contains a required boolean field `availability`.
   */
  public static existsRoleForDatabaseSchema = yup.object().shape({
    availability: yup.boolean().required(),
  });
}
