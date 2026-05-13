import axios, { AxiosError } from "axios";
import { decodeJwt as joseDecodeJwt, type JWTPayload } from "jose";

import { loginFailed } from "../redux/slices/session/sessionSlice";
import { AppDispatch } from "../redux/store";
import { SessionApi } from "./sessionApi";

/** Base API URL configured from environment variables */
const { VITE_API_URL } = import.meta.env;

const baseURL = VITE_API_URL || "";
/** Default headers for axios requests */
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};
/**
 * Axios instance pre-configured with baseURL, timeout, and headers.
 * This instance should be used for all API requests.
 */
export const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 20000,
  headers: headers,
});

/**
 * Safely decode a JWT and return the payload if it's valid.
 * @param token - The JWT string to decode.
 * @returns The decoded JwtPayload or null if invalid.
 */
export const decodeJwt = (token: string): JWTPayload | null => {
  try {
    const decoded = joseDecodeJwt(token); // Decodes the token's payload without verifying the signature
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};
/**
 * Sets the authorization Bearer token in axios headers.
 * If an empty token is provided, it removes the Authorization header.
 * @param accessToken - The access token to set.
 */
export const setBearerToken = (accessToken: string) => {
  if (accessToken === "") {
    delete axiosInstance.defaults.headers.common.Authorization;
  } else {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }
};
/**
 * Sets up axios response interceptors to handle authentication-related errors.
 * Automatically attempts to refresh the access token on 401 errors.
 * @param dispatch - The Redux dispatch function to trigger login failures.
 * @returns A function to remove the interceptor when needed.
 */
export const setupRequestInterceptors = (dispatch: AppDispatch) => {
  const responseHandle = axiosInstance.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error: AxiosError) => {

      const originalRequest = error.config;

      if (!originalRequest) {
        console.warn("Original request is undefined!");
        return Promise.reject(error);
      }
      // If the refresh token request itself fails, log the user out
      const isRefreshRequest = originalRequest.url?.endsWith("/auth/refresh-token");
      if (isRefreshRequest) {
        delete originalRequest.headers.Authorization;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(loginFailed("Refresh token expired."));
        return Promise.reject(error);
      }
      // Handle unauthorized (401) errors by attempting token refresh
      if (error.response?.status === 401) {
        try {
          const newAccessToken = await renewAccessToken();
          setBearerToken(newAccessToken);
          originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          localStorage.setItem("accessToken", newAccessToken);

          return axiosInstance(originalRequest); // Retry the request
        } catch (refreshError) {
          console.error("Token refresh failed!", refreshError);
          setBearerToken("");
          dispatch(loginFailed("Session expired."));
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
  // Function to remove the interceptor when no longer needed
  return () => {
    axiosInstance.interceptors.response.eject(responseHandle);
  };
};
/**
 * Attempts to renew the access token using the refresh token.
 * If the refresh token is missing or expired, an error is thrown.
 * @returns A promise that resolves to the new access token.
 * @throws Error if the refresh token is invalid or expired.
 */
const renewAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token in storage.");
  }

  const decodedRefreshToken = decodeJwt(refreshToken);
  // Validate the refresh token structure and expiration
  if (!decodedRefreshToken || !decodedRefreshToken.exp) {
    localStorage.removeItem("refreshToken");
    throw new Error("Invalid or expired refresh token.");
  }

  const now = Math.ceil(Date.now() / 1000); // Convert to seconds
  if (decodedRefreshToken.exp < now) {
    localStorage.removeItem("refreshToken");
    throw new Error("Refresh token expired.");
  }

  try {
    // Call the API to get a new access token
    const response = await SessionApi.refreshToken({ refreshToken });
    return response.accessToken;
  } catch (error) {
    localStorage.removeItem("refreshToken"); // Clear invalid refresh token
    throw error;
  }
};
