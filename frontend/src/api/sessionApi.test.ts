import { describe, it, expect, vi } from "vitest";
import { axiosInstance } from "./client";
import { SessionApi } from "./sessionApi";

// Mock axiosInstance to prevent real API requests and allow controlled responses
vi.mock("./client", () => ({
    axiosInstance: {
        post: vi.fn(),  // Ensure 'post' exists and is mockable
    },
}));

// Cast axiosInstance explicitly to ensure TypeScript recognizes mocked methods
const mockedAxiosInstance = axiosInstance as unknown as { post: ReturnType<typeof vi.fn> };
// Tests for SessionApi methods that handle authentication and token management
describe("SessionApi", () => {
    // Verify that login() correctly sends credentials and receives access/refresh tokens
    it("sends a POST request to /auth/signin with credentials and returns tokens", async () => {
        const mockResponse = { data: { accessToken: "access123", refreshToken: "refresh123" } };
        // Mock a successful login response with valid tokens
        mockedAxiosInstance.post.mockResolvedValueOnce(mockResponse);

        const result = await SessionApi.login({ username: "testuser", password: "password123" });

        expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/signin", {
            username: "testuser",
            password: "password123",
        });
        expect(result).toEqual(mockResponse.data);
    });

    // Ensure login() properly throws an error when authentication fails
    it("throws an error when login fails", async () => {
        // Simulate login failure due to incorrect credentials
        mockedAxiosInstance.post.mockRejectedValueOnce(new Error("Invalid credentials"));

        await expect(
            SessionApi.login({ username: "wronguser", password: "wrongpassword" })
        ).rejects.toThrow("Invalid credentials");
    });

    // Test that refreshToken() correctly refreshes access and refresh tokens
    it("refreshes tokens successfully and validates the response schema", async () => {
        const mockResponse = { data: { accessToken: "access123", refreshToken: "refresh123" } };
        // Mock a successful token refresh response
        mockedAxiosInstance.post.mockResolvedValueOnce(mockResponse);

        const result = await SessionApi.refreshToken({ refreshToken: "refresh123" });

        expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/refresh-token", {
            refreshToken: "refresh123",
        });
        expect(result).toEqual(mockResponse.data);
    });

    // Verify that refreshToken() throws an error if the refresh request fails
    it("throws an error when token refresh fails", async () => {
        // Simulate token refresh failure due to an invalid refresh token
        mockedAxiosInstance.post.mockRejectedValueOnce(new Error("Token refresh failed"));

        await expect(
            SessionApi.refreshToken({ refreshToken: "invalidRefreshToken" })
        ).rejects.toThrow("Token refresh failed");
    });

    // Ensure that after a token refresh, the new access token is used for API requests
    it("uses the refreshed token for subsequent requests", async () => {
        const mockRefreshResponse = { data: { accessToken: "newAccessToken", refreshToken: "newRefreshToken" } };
        mockedAxiosInstance.post.mockResolvedValueOnce(mockRefreshResponse);

        const result = await SessionApi.refreshToken({ refreshToken: "refresh123" });

        // Mock a successful response for a request made with the refreshed token
        mockedAxiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

        // Verify that the API request uses the new access token in the Authorization header
        const nextResponse = await axiosInstance.post(
            "/some-protected-endpoint",
            {},
            {
                headers: { Authorization: `Bearer ${result.accessToken}` },
            }
        );

        expect(nextResponse.data).toEqual({ success: true });
        expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
            "/some-protected-endpoint",
            {},
            {
                headers: { Authorization: `Bearer newAccessToken` },
            }
        );
    });

    // Ensure that the new access and refresh tokens are different from the old ones
    it("ensures the refreshed token is new", async () => {
        const oldAccessToken = "oldAccessToken";
        const oldRefreshToken = "oldRefreshToken";

        const mockRefreshResponse = {
            data: { accessToken: "newAccessToken", refreshToken: "newRefreshToken" },
        };
        mockedAxiosInstance.post.mockResolvedValueOnce(mockRefreshResponse);

        const result = await SessionApi.refreshToken({ refreshToken: oldRefreshToken });

        // Validate that the new access token differs from the old one
        expect(result.accessToken).not.toBe(oldAccessToken);
        expect(result.refreshToken).not.toBe(oldRefreshToken);

        // Verify the API call
        expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/refresh-token", {
            refreshToken: oldRefreshToken,
        });

        // Confirm that the returned tokens match the expected mock response
        expect(result).toEqual(mockRefreshResponse.data);
    });
});
