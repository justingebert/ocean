import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateRoleForm, { CreateRoleFormProps } from "./CreateRoleForm";
import { EngineType } from "../../types/engine";

// Mock RoleClient to prevent real API calls and allow controlled responses
vi.mock("../../api/roleClient", () => ({
    RoleClient: {
        availabilityRoleForDatabase: vi.fn(),
    },
}));
// Tests for CreateRoleForm component to ensure proper rendering, validation, and interactions
describe("CreateRoleForm", () => {
    // Mock function for handling form submission
    const mockOnSubmit = vi.fn();
    // Mock function for handling form closure
    const mockOnClose = vi.fn();
    // Mock database object used to simulate a real database instance
    const database = {
        name: "testDB",
        id: 1234,
        engine: EngineType.PostgreSQL,
        createdAt: new Date("2023-01-01T00:00:00Z"),
        userId: 5678,
    };
    // Default props for rendering the CreateRoleForm component in tests
    const defaultProps: CreateRoleFormProps = {
        database,
        onSubmit: mockOnSubmit,
        onClose: mockOnClose,
    };
    // Clear all mock function calls before each test to ensure test isolation
    beforeEach(() => {
        vi.clearAllMocks();
    });
    // Ensure the form is rendered with input fields and action buttons
    it("renders the form correctly", () => {
        render(<CreateRoleForm {...defaultProps} />);

        // Check if the label is rendered
        expect(screen.getByText(/username/i)).toBeInTheDocument();

        // Directly query the input field by role (ignoring the label association)
        expect(screen.getByRole("textbox", { name: "" })).toBeInTheDocument();

        // Verify that the Create button is rendered
        expect(screen.getByText(/create/i)).toBeInTheDocument();
        // Verify that the Cancel button is rendered
        expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });
    // Ensure validation messages appear when the form is submitted with invalid input
    it("shows validation errors for invalid input", async () => {
        render(<CreateRoleForm {...defaultProps} />);
        // Simulate clicking the Create button without entering input
        fireEvent.click(screen.getByText(/create/i));
        // Verify that an error message is displayed for missing role name
        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        });
    });
    // Ensure clicking the cancel button triggers the onClose function
    it("calls onClose when cancel button is clicked", () => {
        render(<CreateRoleForm {...defaultProps} />);
        // Simulate clicking the Cancel button
        fireEvent.click(screen.getByText(/cancel/i));
        // Verify that the onClose function was triggered
        expect(mockOnClose).toHaveBeenCalled();
    });
});
