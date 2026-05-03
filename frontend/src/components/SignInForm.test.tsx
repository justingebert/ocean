import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SignInForm from "./SignInForm";

// Tests for SignInForm component to verify form rendering, user interactions, validation, and error handling
describe("<SignInForm />", () => {
    // Verify that the form renders correctly
    it("renders the form with all fields", () => {
        render(<SignInForm />);

        // Check that the username input is present
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        // Check that the password input is present
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        // Check that the sign-in button is present
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    // Validate that input fields update correctly with user input
    it("updates input fields on user input", async () => {
        render(<SignInForm />);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        // Simulate user typing into the username field
        fireEvent.change(usernameInput, { target: { value: "testuser" } });
        // Simulate user typing into the password field
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        await waitFor(() => {
            expect(usernameInput).toHaveValue("testuser");
            expect(passwordInput).toHaveValue("password123");
        });
    });

    // Ensure that the form calls onSubmit with the correct data
    it("calls onSubmit with the correct credentials", async () => {
        // Create a mock function to track calls to onSubmit
        const mockSubmit = vi.fn();

        render(<SignInForm onSubmit={mockSubmit} />);
        // Simulate clicking the sign-in button
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            // Verify that onSubmit was called with the expected username and password
            expect(mockSubmit).toHaveBeenCalledWith({
                username: "testuser",
                password: "password123",
            });
        });
    });

    // Ensure error messages are displayed for empty fields
    it("displays error messages when username or password is empty", async () => {
        render(<SignInForm onSubmit={vi.fn()} />);
        // Simulate clicking the sign-in button without entering credentials
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            // Verify that an error message appears for the username field
            expect(screen.getByText(/username is required/i)).toBeInTheDocument();
            // Verify that an error message appears for the password field
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });

    // Ensure the error message is displayed when errorMessage is provided
    it("displays an error message when errorMessage is set", () => {
        render(<SignInForm errorMessage="Invalid credentials" onSubmit={vi.fn()} />); // Replace jest.fn() with vi.fn()
        // Verify that the error message is displayed in the document
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Ensure the component does not break when onSubmit is not provided
    it("does not throw an error if onSubmit is not provided", async () => {
        render(<SignInForm />);

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
        // Simulate clicking the sign-in button without an onSubmit function
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        // No assertion needed: The test passes if no error is thrown
    });
});
