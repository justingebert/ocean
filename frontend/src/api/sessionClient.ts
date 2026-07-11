import * as yup from "yup";

import { getStoredRefreshToken } from "./tokenStorage";
import { axiosInstance, decodeJwt } from "./client";

export interface CredentialProperties {
  username: string;
  password: string;
}

export interface TokensReturn {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export class SessionClient {
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

  public static async renewAccessToken(): Promise<string> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token in storage.");
    }

    const decodedRefreshToken = decodeJwt(refreshToken);
    const now = Math.ceil(Date.now() / 1000);
    if (!decodedRefreshToken?.exp || decodedRefreshToken.exp < now) {
      throw new Error("Invalid or expired refresh token.");
    }

    const response = await this.refreshToken({ refreshToken });
    return response.accessToken;
  }
}
