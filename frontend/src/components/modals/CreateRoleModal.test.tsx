import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, beforeEach, vi, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import CreateRoleModal, { CreateRoleModalProps } from "./CreateRoleModal";

// Mock the CreateRoleForm component to control its rendering and behavior in tests
vi.mock("../forms/CreateRoleForm", () => {
    return {
        default: vi.fn(({ onSubmit, onClose }: any) => (
            // Mock structure of the CreateRoleForm component to expose onSubmit and onClose handlers
            <div data-testid="create-role-form">
                {/* The mock doesn't render buttons; instead, expose onSubmit and onClose */}
                <button
                    onClick={() => onSubmit({ roleName: "Admin" })}
                    data-testid="submit-button"
                >
                    Submit
                </button>
                <button onClick={onClose} data-testid="close-button">
                    Close
                </button>
            </div>
        )),
    };
});
// Tests for CreateRoleModal component to ensure correct rendering and behavior
describe("CreateRoleModal", () => {
    // Mock function to track form submission
    const mockOnSubmit = vi.fn();
    // Mock function to track modal closure
    const mockOnClose = vi.fn();
    // Default props for rendering the CreateRoleModal component in tests
    const defaultProps: CreateRoleModalProps = {
        open: false,
        onSubmit: mockOnSubmit,
        onClose: mockOnClose,
    };
    // Helper function to render the component with default and custom props
    const renderComponent = (props = {}) => {
        return render(<CreateRoleModal {...defaultProps} {...props} />);
    };
    // Clear all mock function calls before each test to ensure test isolation
    beforeEach(() => {
        vi.clearAllMocks();
    });
    // Ensure the modal does not render when the open prop is set to false
    it("does not render the modal when open is false", () => {
        renderComponent({ open: false });

        // The title should not be in the document
        expect(screen.queryByText("Create a user")).not.toBeInTheDocument();

        // The form should not be in the document
        expect(screen.queryByTestId("create-role-form")).not.toBeInTheDocument();
    });
});
