import * as yup from "yup";

import { axiosInstance } from "./client";
import { UserProperties } from "../types/user";

export class UserClient {
  public static getUser = async (): Promise<UserProperties> => {
    const { data } = await axiosInstance.get<UserProperties>("/user");
    return data;
  };

  public static getUsers = async (): Promise<UserProperties[]> => {
    const { data } = await axiosInstance.get<UserProperties[]>("/users");
    return data;
  };
}

export class UserValidation {
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
