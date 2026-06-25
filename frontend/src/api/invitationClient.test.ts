import { describe, it, expect, afterEach, vi } from "vitest";
import { InvitationClient } from "./invitationClient";
import { axiosInstance } from "./client";

vi.mock("./client", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("InvitationClient", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getInvitationsForDatabase", () => {
    it("should fetch invitations for a database", async () => {
      const mockData = [
        { id: 1, instanceId: 100, userId: 200, createdAt: new Date() },
        { id: 2, instanceId: 101, userId: 201, createdAt: new Date() },
      ];

      (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockData,
      });

      const result = await InvitationClient.getInvitationsForDatabase(1);
      expect(axiosInstance.get).toHaveBeenCalledWith("databases/1/invitations");
      expect(result).toEqual(mockData);
    });

    it("should handle errors gracefully", async () => {
      (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network Error"),
      );

      await expect(InvitationClient.getInvitationsForDatabase(1)).rejects.toThrow("Network Error");
    });
  });

  describe("createInvitationForDatabase", () => {
    it("should create an invitation for a database", async () => {
      const mockInput = { instanceId: 100, userId: 200 };
      const mockResponse = { id: 1, instanceId: 100, userId: 200, createdAt: new Date() };

      (axiosInstance.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await InvitationClient.createInvitationForDatabase(mockInput);
      expect(axiosInstance.post).toHaveBeenCalledWith("/invitations", mockInput);
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors gracefully", async () => {
      const mockInput = { instanceId: 100, userId: 200 };
      (axiosInstance.post as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network Error"),
      );

      await expect(InvitationClient.createInvitationForDatabase(mockInput)).rejects.toThrow(
        "Network Error",
      );
    });
  });

  describe("deleteInvitationForDatabase", () => {
    it("should delete an invitation by ID", async () => {
      const mockResponse = { success: true };

      (axiosInstance.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await InvitationClient.deleteInvitationForDatabase(1);
      expect(axiosInstance.delete).toHaveBeenCalledWith("/invitations/1");
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors gracefully", async () => {
      (axiosInstance.delete as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network Error"),
      );

      await expect(InvitationClient.deleteInvitationForDatabase(1)).rejects.toThrow(
        "Network Error",
      );
    });
  });
});
