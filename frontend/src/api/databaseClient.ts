import * as yup from "yup";

import { DatabaseProperties, UpstreamDatabaseProperties } from "../types/database";
import { axiosInstance } from "./client";

interface AvailabilityResponse {
  availability: boolean;
}

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

  public static availabilityDatabase = (database: UpstreamDatabaseProperties) =>
    axiosInstance.post<AvailabilityResponse>("/databases/_availability_", database);

  public static deleteDatabase = async (id: number) => {
    const { data } = await axiosInstance.delete<unknown>(`/databases/${id.toString()}`);
    return data;
  };

  public static deleteDatabaseWithPermission = async (id: number) => {
    const { data } = await axiosInstance.delete<unknown>(
      `/databases/${id.toString()}/_permission_`,
    );
    return data;
  };
}

export class DatabaseValidation {
  public static availabilityDatabaseSchema = yup.object().shape({
    availability: yup.boolean().required(),
  });
}
