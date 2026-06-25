import axios, { AxiosError } from "axios";
import { decodeJwt as joseDecodeJwt, type JWTPayload } from "jose";

import { loginFailed } from "../redux/slices/session/sessionSlice";
import { AppDispatch } from "../redux/store";
import { config } from "../config";
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

export const setupRequestInterceptors = (dispatch: AppDispatch) => {
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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(loginFailed("Refresh token expired."));
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        try {
          const newAccessToken = await renewAccessToken();
          setBearerToken(newAccessToken);
          originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          localStorage.setItem("accessToken", newAccessToken);

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed!", refreshError);
          setBearerToken("");
          dispatch(loginFailed("Session expired."));
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
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token in storage.");
  }

  const decodedRefreshToken = decodeJwt(refreshToken);

  if (!decodedRefreshToken || !decodedRefreshToken.exp) {
    localStorage.removeItem("refreshToken");
    throw new Error("Invalid or expired refresh token.");
  }

  const now = Math.ceil(Date.now() / 1000);
  if (decodedRefreshToken.exp < now) {
    localStorage.removeItem("refreshToken");
    throw new Error("Refresh token expired.");
  }

  try {
    const response = await SessionApi.refreshToken({ refreshToken });
    return response.accessToken;
  } catch (error) {
    localStorage.removeItem("refreshToken");
    throw error;
  }
};
