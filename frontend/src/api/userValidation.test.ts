import { describe, it, expect } from "vitest";
import { UserValidation } from "./userClient";
// Tests for UserValidation schema, ensuring username and password meet requirements
describe("UserValidation", () => {
    // Ensure that valid username and password pass schema validation
    it("should pass validation for a valid username and password", async () => {
        // Sample valid user credentials for testing
        const validData = { username: "testuser", password: "password123" };
        await expect(UserValidation.loginSchema.validate(validData)).resolves.toBe(validData);
    });
    // Ensure that validation fails when username is absent
    it("should fail validation if username is missing", async () => {
        // Sample invalid data with a missing username
        const invalidData = { password: "password123" };
        await expect(UserValidation.loginSchema.validate(invalidData)).rejects.toThrow("Username is required");
    });
    // Ensure validation rejects usernames with special characters
    it("should fail validation if username contains invalid characters", async () => {
        const invalidData = { username: "Invalid!", password: "password123" };
        await expect(UserValidation.loginSchema.validate(invalidData)).rejects.toThrow(
            "Username must contain small letters or digits."
        );
    });
    // Ensure validation enforces minimum password length
    it("should fail validation if password is too short", async () => {
        const invalidData = { username: "testuser", password: "123" };
        await expect(UserValidation.loginSchema.validate(invalidData)).rejects.toThrow(
            "Password should be of minimum 4 characters length"
        );
    });
    // Ensure that validation fails when password is absent
    it("should fail validation if password is missing", async () => {
        const invalidData = { username: "testuser" };
        await expect(UserValidation.loginSchema.validate(invalidData)).rejects.toThrow("Password is required");
    });
});
