import { describe, it, expect, afterEach } from "vitest";
import { RoleClient } from "./roleClient";
import MockAdapter from "axios-mock-adapter";
import { axiosInstance } from "./client";

const mockAxios = new MockAdapter(axiosInstance);

describe("RoleClient Tests", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("should fetch roles for a database", async () => {
    const databaseId = 1;
    const mockRoles = [{ id: 1, name: "Admin" }];

    mockAxios.onGet(`databases/${databaseId}/roles`).reply(200, mockRoles);

    const roles = await RoleClient.getRolesForDatabase(databaseId);

    expect(roles).toEqual(mockRoles);

    expect(mockAxios.history.get[0].url).toBe(`databases/${databaseId}/roles`);
  });

  it("should create a role for a database", async () => {
    const newRole = {
      roleName: "Editor",
      permissions: ["read", "write"],
      instanceId: 1,
    };
    const createdRole = { id: 2, ...newRole };

    mockAxios.onPost("/roles").reply(201, createdRole);

    const result = await RoleClient.createRoleForDatabase(newRole);

    expect(result).toEqual(createdRole);
    expect(mockAxios.history.post[0].url).toBe("/roles");

    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(newRole);
  });

  it("should check the availability of a role for a database", async () => {
    const mockRole = {
      roleName: "Viewer",
      permissions: ["read"],
      instanceId: 1,
    };
    const mockResponse = { available: true };

    mockAxios.onPost("/roles/_availability_").reply(200, mockResponse);

    const response = await RoleClient.availabilityRoleForDatabase(mockRole);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockResponse);

    expect(mockAxios.history.post[0].url).toBe("/roles/_availability_");
    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(mockRole);
  });

  it("should delete a role by ID and return the response data", async () => {
    const roleId = 3;
    const mockResponse = { success: true };

    mockAxios.onDelete(`/roles/${roleId}`).reply(200, mockResponse);

    const response = await RoleClient.deleteRoleForDatabase(roleId);

    expect(response).toEqual(mockResponse);

    expect(mockAxios.history.delete[0].url).toBe(`/roles/${roleId}`);
  });

  it("should throw an error when the server returns an error", async () => {
    const roleId = 3;

    mockAxios.onDelete(`/roles/${roleId}`).reply(500);

    await expect(RoleClient.deleteRoleForDatabase(roleId)).rejects.toThrow(
      "Request failed with status code 500",
    );
  });
});
