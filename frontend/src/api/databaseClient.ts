import * as yup from "yup";

import {
  DatabaseProperties,
  UpstreamDatabaseProperties,
} from "../types/database";
import { axiosInstance } from "./client";

interface AvailabilityResponse {
  availability: boolean;
}

export class DatabaseClient {
  /**
   * Fetches all databases from all users.
   * Requires `Staff` permission to access this endpoint.
   * @returns A promise that resolves to an array of all database properties.
   */
  public static getAllDatabases = async (): Promise<DatabaseProperties[]> => {
    const { data } = await axiosInstance.get<DatabaseProperties[]>(
      "/databases/_all_"
    );
    return data;
  };

  /**
   * Fetches all databases related to the currently authenticated user.
   * @returns A promise that resolves to an array of database properties.
   */
  public static getUserDatabases = async (): Promise<DatabaseProperties[]> => {
    const { data } = await axiosInstance.get<DatabaseProperties[]>(
      "/databases"
    );
    return data;
  };

  /**
   * Fetches details of a single database by its unique ID.
   * @param id - The unique identifier of the database.
   * @returns A promise that resolves to the database properties.
   */
  public static getDatabase = async (
    id: number
  ): Promise<DatabaseProperties> => {
    const { data } = await axiosInstance.get<DatabaseProperties>(
      `/databases/${id.toString()}`
    );
    return data;
  };

  /**
   * Creates a new database entry.
   * @param database - The properties of the database to be created.
   * @returns A promise that resolves to the created database properties.
   */
  public static createDatabase = async (
    database: UpstreamDatabaseProperties
  ): Promise<DatabaseProperties> => {
    const { data } = await axiosInstance.post<DatabaseProperties>(
      "/databases",
      database
    );
    return data;
  };

  /**
   * Checks if a database with the given properties already exists.
   * @param database - The properties of the database to check availability for.
   * @returns A promise that resolves with the availability status.
   */
  public static availabilityDatabase = (database: UpstreamDatabaseProperties) =>
    axiosInstance.post<AvailabilityResponse>("/databases/_availability_", database);

  /**
   * Deletes a database by its unique ID.
   * @param id - The unique identifier of the database to delete.
   * @returns A promise that resolves to the deletion response.
   */
  public static deleteDatabase = async (id: number) => {
    const { data } = await axiosInstance.delete<unknown>(
      `/databases/${id.toString()}`
    );
    return data;
  };

  /**
   * Deletes a database by its ID from any user.
   * Requires additional permissions to perform this operation.
   * @param id - The unique identifier of the database to delete.
   * @returns A promise that resolves to the deletion response.
   */
  public static deleteDatabaseWithPermission = async (id: number) => {
    const { data } = await axiosInstance.delete<unknown>(
      `/databases/${id.toString()}/_permission_`
    );
    return data;
  };
}

export class DatabaseValidation {
  /**
   * Schema definition for checking database availability.
   * Ensures the response contains a required boolean field `availability`.
   */
  public static availabilityDatabaseSchema = yup.object().shape({
    availability: yup.boolean().required(),
  });
}
