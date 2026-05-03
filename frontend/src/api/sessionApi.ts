import * as yup from "yup";

import { CredentialProperties } from "../types/models";

import { axiosInstance } from "./client";
/**
 * Interface defining the structure of authentication tokens.
 */
export interface TokensReturn {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export class SessionApi {
  /**
   * Validation schema for authentication tokens.
   * Ensures that both `accessToken` and `refreshToken` are required strings.
   */
  private static tokensSchema = yup.object().shape({
    accessToken: yup.string().required(),
    refreshToken: yup.string().required(),
  });
  /**
   * Logs in a user with the provided credentials.
   * @param credentials - The user's login credentials (e.g., email and password).
   * @returns A promise that resolves to the authentication tokens.
   */
  public static async login(
    credentials: CredentialProperties
  ): Promise<TokensReturn> {
    const { data } = await axiosInstance.post("/auth/signin", credentials);
    return data;
  }
  /**
   * Refreshes the authentication token using the provided refresh token.
   * Validates the response using a schema before returning.
   * @param params - Object containing the `refreshToken`.
   * @returns A promise that resolves to the new authentication tokens.
   * @throws An error if the response does not match the expected token structure.
   */
  public static async refreshToken(params: {
    refreshToken: string;
  }): Promise<TokensReturn> {
    const { data } = await axiosInstance.post("/auth/refresh-token", params);
    // Validate and return the response
    return this.tokensSchema.validateSync(data);
  }
}