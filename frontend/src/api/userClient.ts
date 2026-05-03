import * as yup from "yup";

import { axiosInstance } from "./client";
import { UserProperties } from "../types/user";

export class UserClient {
  /**
   * Fetches the authenticated user's data.
   * @returns A promise that resolves to the user properties.
   */
  public static getUser = async (): Promise<UserProperties> => {
    const { data } = await axiosInstance.get<UserProperties>("/user");
    return data;
  };

  /**
   * Fetches a list of all users.
   * @returns A promise that resolves to an array of user properties.
   */
  public static getUsers = async (): Promise<UserProperties[]> => {
    const { data } = await axiosInstance.get<UserProperties[]>("/users");
    return data;
  };
}

export class UserValidation {
  /**
   * Schema for user login validation.
   * Ensures that both `username` and `password` meet the required constraints.
   */
  public static loginSchema = yup.object().shape({
    username: yup
      .string()
      .required("Username is required")
      .matches(/^[a-z0-9]*$/, "Username must contain small letters or digits."),
    password: yup
      .string()
      .min(4, "Password should be of minimum 4 characters length")
      .required("Password is required"),
  });
}
