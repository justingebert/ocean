import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import SignInForm from "./SignInForm";

describe("<SignInForm />", () => {
  it("renders the form with all fields", () => {
    render(<SignInForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("updates input fields on user input", async () => {
    render(<SignInForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });

    fireEvent.change(passwordInput, { target: { value: "password123" } });

    await waitFor(() => {
      expect(usernameInput).toHaveValue("testuser");
      expect(passwordInput).toHaveValue("password123");
    });
  });

  it("calls onSubmit with the correct credentials", async () => {
    const mockSubmit = vi.fn();

    render(<SignInForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
      });
    });
  });

  it("displays error messages when username or password is empty", async () => {
    render(<SignInForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("displays an error message when errorMessage is set", () => {
    render(<SignInForm errorMessage="Invalid credentials" onSubmit={vi.fn()} />);

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("does not throw an error if onSubmit is not provided", async () => {
    const user = userEvent.setup();

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    await user.click(screen.getByRole("button", { name: /sign in/i }));
  });
});
