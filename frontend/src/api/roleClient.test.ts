import { describe, it, expect, afterEach } from "vitest";
import { RoleClient } from "./roleClient";
import MockAdapter from "axios-mock-adapter";
import { axiosInstance } from "./client";

// Create a mock adapter for axiosInstance to intercept API calls
const mockAxios = new MockAdapter(axiosInstance);

// Tests for RoleClient methods that interact with role-related API endpoints
describe("RoleClient Tests", () => {
    // Reset axios mock after each test to avoid test interference
    afterEach(() => {
        mockAxios.reset();
    });
    // Ensure getRolesForDatabase() correctly retrieves roles for a given database ID
    it("should fetch roles for a database", async () => {
        const databaseId = 1;
        const mockRoles = [{ id: 1, name: "Admin" }];
        // Mock the API response for fetching database roles
        mockAxios.onGet(`databases/${databaseId}/roles`).reply(200, mockRoles);

        const roles = await RoleClient.getRolesForDatabase(databaseId);

        expect(roles).toEqual(mockRoles);
        // Verify that the correct API endpoint was called
        expect(mockAxios.history.get[0].url).toBe(`databases/${databaseId}/roles`);
    });

    // Test that createRoleForDatabase() correctly sends a request to create a new role
    it("should create a role for a database", async () => {
        const newRole = {
            roleName: "Editor", // Updated property name to `roleName`
            permissions: ["read", "write"],
            instanceId: 1,
        };
        const createdRole = { id: 2, ...newRole };
        // Mock the API response for role creation
        mockAxios.onPost("/roles").reply(201, createdRole);

        const result = await RoleClient.createRoleForDatabase(newRole);

        expect(result).toEqual(createdRole);
        expect(mockAxios.history.post[0].url).toBe("/roles");
        // Verify that the request payload matches the expected role data
        expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(newRole);
    });

    // Verify that the request payload matches the expected role data
    it("should check the availability of a role for a database", async () => {
        const mockRole = {
            roleName: "Viewer",
            permissions: ["read"],
            instanceId: 1,
        };
        const mockResponse = { available: true }; // Mocked API response

        // Mock the API response for role availability check
        mockAxios.onPost("/roles/_availability_").reply(200, mockResponse);

        // Call the method
        const response = await RoleClient.availabilityRoleForDatabase(mockRole);

        // Assertions
        expect(response.status).toBe(200); // Axios response status
        expect(response.data).toEqual(mockResponse); // Mocked response data
        // Ensure that the API call is made to the correct endpoint
        expect(mockAxios.history.post[0].url).toBe("/roles/_availability_"); // Endpoint
        expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(mockRole); // Payload
    });

    // Ensure deleteRoleForDatabase() correctly removes a role by ID
    it("should delete a role by ID and return the response data", async () => {
        const roleId = 3; // ID of the role to delete
        const mockResponse = { success: true }; // Mocked response data

        // Mock the API response for deleting a role
        mockAxios.onDelete(`/roles/${roleId}`).reply(200, mockResponse);

        // Call the method
        const response = await RoleClient.deleteRoleForDatabase(roleId);

        // Assertions
        expect(response).toEqual(mockResponse); // Response data matches the mock
        // Verify that the correct role deletion endpoint was called
        expect(mockAxios.history.delete[0].url).toBe(`/roles/${roleId}`);
    });

    // Verify that deleteRoleForDatabase() throws an error if the API request fails
    it("should throw an error when the server returns an error", async () => {
        const roleId = 3;

        // Mock an API failure scenario where the server returns a 500 error
        mockAxios.onDelete(`/roles/${roleId}`).reply(500);

        // Call the method and expect it to throw
        await expect(RoleClient.deleteRoleForDatabase(roleId)).rejects.toThrow("Request failed with status code 500");
    });
});
