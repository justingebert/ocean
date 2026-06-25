import * as yup from "yup";

import { DatabaseProperties, UpstreamDatabaseProperties } from "../types/database";
import { axiosInstance } from "./client";

interface AvailabilityResponse {
  availability: boolean;
}

const availabilityDatabaseSchema: yup.ObjectSchema<AvailabilityResponse> = yup.object({
  availability: yup.boolean().required(),
});

export class DatabaseClient {
  public static getAllDatabases = async (): Promise<DatabaseProperties[]> => {
    const { data } = await axiosInstance.get<DatabaseProperties[]>("/databases/_all_");
    return data;
  };

  public static getUserDatabases = async (): Promise<DatabaseProperties[]> => {
    const { data } = await axiosInstance.get<DatabaseProperties[]>("/databases");
    return data;
  };

  public static getDatabase = async (id: number): Promise<DatabaseProperties> => {
    const { data } = await axiosInstance.get<DatabaseProperties>(`/databases/${id.toString()}`);
    return data;
  };

  public static createDatabase = async (
    database: UpstreamDatabaseProperties,
  ): Promise<DatabaseProperties> => {
    const { data } = await axiosInstance.post<DatabaseProperties>("/databases", database);
    return data;
  };

  public static availabilityDatabase = async (
    database: UpstreamDatabaseProperties,
  ): Promise<boolean> => {
    const { data } = await axiosInstance.post<AvailabilityResponse>(
      "/databases/_availability_",
      database,
    );

    return availabilityDatabaseSchema.validateSync(data).availability;
  };

  public static deleteDatabase = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/databases/${id.toString()}`);
  };

  public static deleteDatabaseWithPermission = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/databases/${id.toString()}/_permission_`);
  };
}
