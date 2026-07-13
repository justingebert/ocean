import { describe, it, expect } from "vitest";
import { loginSchema } from "./validation";

describe("loginSchema", () => {
  it("should pass validation for a valid username and password", async () => {
    const validData = { username: "testuser", password: "password123" };
    await expect(loginSchema.parseAsync(validData)).resolves.toEqual(validData);
  });

  it("should fail validation if username is missing", async () => {
    const invalidData = { password: "password123" };
    await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow();
  });

  it("should fail validation if username contains invalid characters", async () => {
    const invalidData = { username: "Invalid!", password: "password123" };
    await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow(
      "Username must contain small letters or digits.",
    );
  });

  it("should fail validation if password is too short", async () => {
    const invalidData = { username: "testuser", password: "123" };
    await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow(
      "Password should be of minimum 4 characters length",
    );
  });

  it("should fail validation if password is missing", async () => {
    const invalidData = { username: "testuser" };
    await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow();
  });
});
