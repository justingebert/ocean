import { describe, it, expect, afterEach, vi } from "vitest";
import { UserClient } from "./userClient";
import { axiosInstance } from "./client";
import { AxiosResponse } from "axios";

// Mock axiosInstance to prevent real API requests and allow controlled responses
vi.mock("./client", () => ({
    axiosInstance: {
        get: vi.fn(),
    },
}));

// Tests for UserClient methods that interact with user-related API endpoints
describe("UserClient", () => {
    // Clear all mocks after each test to prevent test interference
    afterEach(() => {
        vi.clearAllMocks();
    });
    // Ensure getUser() correctly retrieves user data from the API
    it("should fetch user data", async () => {
        // Mock API response representing a single user's data
        const mockUser = { id: 1, username: "testuser", email: "test@example.com" };
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockUser } as AxiosResponse);

        const user = await UserClient.getUser();
        expect(user).toEqual(mockUser);
        // Verify that the correct API endpoint was called for fetching user data
        expect(axiosInstance.get).toHaveBeenCalledWith("/user");
    });
    // Ensure getUsers() correctly retrieves a list of users from the API
    it("should fetch a list of users", async () => {
        // Mock API response representing multiple users' data
        const mockUsers = [
            { id: 1, username: "user1", email: "user1@example.com" },
            { id: 2, username: "user2", email: "user2@example.com" },
        ];
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockUsers } as AxiosResponse);

        const users = await UserClient.getUsers();
        expect(users).toEqual(mockUsers);
        // Verify that the correct API endpoint was called for fetching multiple users
        expect(axiosInstance.get).toHaveBeenCalledWith("/users");
    });
    // Ensure getUser() correctly handles errors when API requests fail
    it("should handle errors when fetching user data", async () => {
        // Simulate an API failure scenario with a network error
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network Error"));
        // Verify that an error is thrown when the API request fails
        await expect(UserClient.getUser()).rejects.toThrow("Network Error");
        expect(axiosInstance.get).toHaveBeenCalledWith("/user");
    });
});
