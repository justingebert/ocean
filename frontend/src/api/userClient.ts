import { axiosInstance } from "./client";
import { UserProperties } from "@/types/user";

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
