import axios from "axios";
import { z } from "zod";

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

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Incorrect username or password.");
    this.name = "InvalidCredentialsError";
  }
}

export class SessionClient {
  private static tokensSchema = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  });

  public static async login(credentials: CredentialProperties): Promise<TokensReturn> {
    try {
      const { data } = await axiosInstance.post("/auth/signin", credentials);
      return data;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        throw new InvalidCredentialsError();
      }

      if (axios.isAxiosError(error)) {
        throw new Error("Unable to sign in right now. Please try again.");
      }

      throw error;
    }
  }

  public static async refreshToken(params: { refreshToken: string }): Promise<TokensReturn> {
    const { data } = await axiosInstance.post("/auth/refresh-token", params);

    return this.tokensSchema.parse(data);
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
