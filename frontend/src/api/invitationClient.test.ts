import { describe, it, expect, afterEach, vi } from "vitest";
import { InvitationClient } from "./invitationClient";
import { axiosInstance } from "./client";

// Mock axiosInstance to prevent real API requests and allow controlled responses
vi.mock("./client", () => ({
    axiosInstance: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

// Tests for the InvitationClient methods that interact with the API
describe("InvitationClient", () => {
    // Clear all mocks after each test to ensure independent test execution
    afterEach(() => {
        vi.clearAllMocks();
    });

    // Tests for fetching invitations associated with a specific database
    describe("getInvitationsForDatabase", () => {
        // Verify that getInvitationsForDatabase() correctly retrieves invitation data
        it("should fetch invitations for a database", async () => {
            // Sample invitation data returned by the API for testing
            const mockData = [
                { id: 1, instanceId: 100, userId: 200, createdAt: new Date() },
                { id: 2, instanceId: 101, userId: 201, createdAt: new Date() },
            ];
            // Mock API response to simulate expected server behavior
            (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

            const result = await InvitationClient.getInvitationsForDatabase(1);
            expect(axiosInstance.get).toHaveBeenCalledWith("databases/1/invitations");
            expect(result).toEqual(mockData);
        });

        // Ensure getInvitationsForDatabase() properly handles API request failures
        it("should handle errors gracefully", async () => {
            (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network Error"));

            await expect(InvitationClient.getInvitationsForDatabase(1)).rejects.toThrow("Network Error");
        });
    });
    // Tests for creating new invitations in a database
    describe("createInvitationForDatabase", () => {
        // Verify that createInvitationForDatabase() sends the correct request and returns the expected response
        it("should create an invitation for a database", async () => {
            const mockInput = { instanceId: 100, userId: 200 };
            const mockResponse = { id: 1, instanceId: 100, userId: 200, createdAt: new Date() };

            (axiosInstance.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockResponse });

            const result = await InvitationClient.createInvitationForDatabase(mockInput);
            expect(axiosInstance.post).toHaveBeenCalledWith("/invitations", mockInput);
            expect(result).toEqual(mockResponse);
        });
        // Ensure createInvitationForDatabase() properly handles API request failures
        it("should handle errors gracefully", async () => {
            const mockInput = { instanceId: 100, userId: 200 };
            (axiosInstance.post as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network Error"));

            await expect(InvitationClient.createInvitationForDatabase(mockInput)).rejects.toThrow("Network Error");
        });
    });
    // Tests for deleting invitations from a database
    describe("deleteInvitationForDatabase", () => {
        // Ensure deleteInvitationForDatabase() successfully removes an invitation by ID
        it("should delete an invitation by ID", async () => {
            const mockResponse = { success: true };

            (axiosInstance.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockResponse });

            const result = await InvitationClient.deleteInvitationForDatabase(1);
            expect(axiosInstance.delete).toHaveBeenCalledWith("/invitations/1");
            expect(result).toEqual(mockResponse);
        });
        // Verify deleteInvitationForDatabase() correctly handles deletion failures
        it("should handle errors gracefully", async () => {
            (axiosInstance.delete as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network Error"));

            await expect(InvitationClient.deleteInvitationForDatabase(1)).rejects.toThrow("Network Error");
        });
    });
});
