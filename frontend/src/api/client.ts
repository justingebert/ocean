import axios, { AxiosError } from "axios";
import { decodeJwt as joseDecodeJwt, type JWTPayload } from "jose";

import { config } from "../config";
import { clearStoredTokens, getStoredRefreshToken, storeAccessToken } from "../auth/tokenStorage";
import { SessionApi } from "./sessionApi";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 20000,
  headers: headers,
});

export const decodeJwt = (token: string): JWTPayload | null => {
  try {
    const decoded = joseDecodeJwt(token);
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};
export const setBearerToken = (accessToken: string) => {
  if (accessToken === "") {
    delete axiosInstance.defaults.headers.common.Authorization;
  } else {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }
};

type SessionExpiredHandler = (message: string) => void;

export const setupRequestInterceptors = (onSessionExpired: SessionExpiredHandler) => {
  const responseHandle = axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      if (!originalRequest) {
        console.warn("Original request is undefined!");
        return Promise.reject(error);
      }

      const isRefreshRequest = originalRequest.url?.endsWith("/auth/refresh-token");
      if (isRefreshRequest) {
        delete originalRequest.headers.Authorization;
        clearStoredTokens();
        setBearerToken("");
        onSessionExpired("Refresh token expired.");
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        try {
          const newAccessToken = await renewAccessToken();
          setBearerToken(newAccessToken);
          originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          storeAccessToken(newAccessToken);

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed!", refreshError);
          clearStoredTokens();
          setBearerToken("");
          onSessionExpired("Session expired.");
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );

  return () => {
    axiosInstance.interceptors.response.eject(responseHandle);
  };
};
const renewAccessToken = async (): Promise<string> => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token in storage.");
  }

  const decodedRefreshToken = decodeJwt(refreshToken);

  if (!decodedRefreshToken?.exp) {
    throw new Error("Invalid or expired refresh token.");
  }

  const now = Math.ceil(Date.now() / 1000);
  if (decodedRefreshToken.exp < now) {
    throw new Error("Refresh token expired.");
  }

  const response = await SessionApi.refreshToken({ refreshToken });
  return response.accessToken;
};
