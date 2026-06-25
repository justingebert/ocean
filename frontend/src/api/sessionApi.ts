import * as yup from "yup";

import { CredentialProperties } from "../types/models";

import { axiosInstance } from "./client";

export interface TokensReturn {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export class SessionApi {
  private static tokensSchema = yup.object().shape({
    accessToken: yup.string().required(),
    refreshToken: yup.string().required(),
  });

  public static async login(credentials: CredentialProperties): Promise<TokensReturn> {
    const { data } = await axiosInstance.post("/auth/signin", credentials);
    return data;
  }

  public static async refreshToken(params: { refreshToken: string }): Promise<TokensReturn> {
    const { data } = await axiosInstance.post("/auth/refresh-token", params);

    return this.tokensSchema.validateSync(data);
  }
}
