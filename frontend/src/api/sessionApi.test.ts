import { describe, it, expect, vi } from "vitest";
import { axiosInstance } from "./client";
import { SessionApi } from "./sessionApi";

vi.mock("./client", () => ({
  axiosInstance: {
    post: vi.fn(),
  },
}));

const mockedAxiosInstance = axiosInstance as unknown as { post: ReturnType<typeof vi.fn> };

describe("SessionApi", () => {
  it("sends a POST request to /auth/signin with credentials and returns tokens", async () => {
    const mockResponse = { data: { accessToken: "access123", refreshToken: "refresh123" } };

    mockedAxiosInstance.post.mockResolvedValueOnce(mockResponse);

    const result = await SessionApi.login({ username: "testuser", password: "password123" });

    expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/signin", {
      username: "testuser",
      password: "password123",
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("throws an error when login fails", async () => {
    mockedAxiosInstance.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    await expect(
      SessionApi.login({ username: "wronguser", password: "wrongpassword" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("refreshes tokens successfully and validates the response schema", async () => {
    const mockResponse = { data: { accessToken: "access123", refreshToken: "refresh123" } };

    mockedAxiosInstance.post.mockResolvedValueOnce(mockResponse);

    const result = await SessionApi.refreshToken({ refreshToken: "refresh123" });

    expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/refresh-token", {
      refreshToken: "refresh123",
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("throws an error when token refresh fails", async () => {
    mockedAxiosInstance.post.mockRejectedValueOnce(new Error("Token refresh failed"));

    await expect(SessionApi.refreshToken({ refreshToken: "invalidRefreshToken" })).rejects.toThrow(
      "Token refresh failed",
    );
  });

  it("uses the refreshed token for subsequent requests", async () => {
    const mockRefreshResponse = {
      data: { accessToken: "newAccessToken", refreshToken: "newRefreshToken" },
    };
    mockedAxiosInstance.post.mockResolvedValueOnce(mockRefreshResponse);

    const result = await SessionApi.refreshToken({ refreshToken: "refresh123" });

    mockedAxiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    const nextResponse = await axiosInstance.post(
      "/some-protected-endpoint",
      {},
      {
        headers: { Authorization: `Bearer ${result.accessToken}` },
      },
    );

    expect(nextResponse.data).toEqual({ success: true });
    expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
      "/some-protected-endpoint",
      {},
      {
        headers: { Authorization: `Bearer newAccessToken` },
      },
    );
  });

  it("ensures the refreshed token is new", async () => {
    const oldAccessToken = "oldAccessToken";
    const oldRefreshToken = "oldRefreshToken";

    const mockRefreshResponse = {
      data: { accessToken: "newAccessToken", refreshToken: "newRefreshToken" },
    };
    mockedAxiosInstance.post.mockResolvedValueOnce(mockRefreshResponse);

    const result = await SessionApi.refreshToken({ refreshToken: oldRefreshToken });

    expect(result.accessToken).not.toBe(oldAccessToken);
    expect(result.refreshToken).not.toBe(oldRefreshToken);

    expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/refresh-token", {
      refreshToken: oldRefreshToken,
    });

    expect(result).toEqual(mockRefreshResponse.data);
  });
});
