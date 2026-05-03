import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RoleListEntry from "./RoleListEntry";

type RoleListEntryProps = React.ComponentProps<typeof RoleListEntry>;
// Tests for RoleListEntry component to verify correct rendering, toggling, and deletion behavior
describe("RoleListEntry Component", () => {
    // Mock data representing a single role entry for testing component rendering and interactions
    const mockRole = { id: 1, instanceId: 123, name: "Admin", password: "admin123" };
    // Mock function to track calls to the onDelete handler
    const mockOnDelete = vi.fn();
    // Helper function to render the RoleListEntry component with default or custom props
    const renderComponent = (props: Partial<RoleListEntryProps> = {}) => {
        const defaultProps: RoleListEntryProps = {
            role: mockRole,
            onDelete: mockOnDelete,
            ...props,
        };
        return render(<RoleListEntry {...defaultProps} />);
    };
    // Ensure the component renders the role name and the "show" button while hiding the password initially
    it('renders the role name and "show" button initially', () => {
        renderComponent();
        // Verify that the role name is displayed in the document
        expect(screen.getByText(mockRole.name)).toBeInTheDocument();
        // Verify that the role name is displayed in the document
        expect(screen.getByText("show")).toBeInTheDocument();
        // Ensure the password is hidden by default
        expect(screen.queryByText(mockRole.password)).not.toBeInTheDocument();
    });
    // Ensure clicking "show" reveals the password, and clicking "hide" hides it again
    it('toggles the password visibility when "show" and "hide" are clicked', () => {
        renderComponent();
        // Simulate clicking the "show" button to display the password
        fireEvent.click(screen.getByText("show"));
        // Verify that the password is now visible
        expect(screen.getByText(mockRole.password)).toBeInTheDocument();
        // Simulate clicking the "hide" button to hide the password again
        expect(screen.getByText("hide")).toBeInTheDocument();

        // Click "hide"
        fireEvent.click(screen.getByText("hide"));
        // Confirm that the password is no longer displayed
        expect(screen.queryByText(mockRole.password)).not.toBeInTheDocument();
        expect(screen.getByText("show")).toBeInTheDocument();
    });
    // Ensure clicking the "Delete" button triggers the onDelete function with the correct role data
    it('calls onDelete with the correct role when "Delete" is clicked', () => {
        renderComponent();
        // Simulate clicking the "Delete" button
        fireEvent.click(screen.getByText("Delete"));
        // Verify that the onDelete function was called exactly once
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        // Ensure that onDelete was called with the correct role object
        expect(mockOnDelete).toHaveBeenCalledWith(mockRole);
    });
});
