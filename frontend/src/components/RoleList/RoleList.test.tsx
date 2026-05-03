import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RoleList, { RoleListProps } from "./RoleList";

// Mock RoleListEntry to control rendering and behavior in tests
vi.mock("./RoleListEntry", () => ({
    default: ({ role, onDelete }: { role: any; onDelete: () => void }) => (
        <tr>
            <td>{role.name}</td>
            <td>{role.password}</td>
            <td>
                <button onClick={onDelete} data-testid={`delete-${role.name}`}>
                    Delete
                </button>
            </td>
        </tr>
    ),
}));

// Mock data representing roles for testing role list rendering and interactions
const mockRoles = [
    { id: 1, instanceId: 123, name: "Admin", password: "admin123" },
    { id: 2, instanceId: 456, name: "User", password: "user123" },
];

// Mock function to track calls to the onDelete handler
const mockOnDelete = vi.fn();
// Helper function to render the RoleList component with default or custom props
const renderComponent = (props: Partial<RoleListProps> = {}) => {
    const defaultProps: RoleListProps = {
        roles: mockRoles,
        onDelete: mockOnDelete,
        ...props,
    };

    render(<RoleList {...defaultProps} />);
};

describe("RoleList Component", () => {
    // Ensure the table headers are displayed correctly
    it("renders the table headers correctly", () => {
        renderComponent();
        // Verify that the Name column header is displayed
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Password")).toBeInTheDocument();
        expect(screen.getByText("Action")).toBeInTheDocument();
    });
    // Ensure all roles are displayed in the table
    it("renders the list of roles", () => {
        renderComponent();
        // Verify that each role name and password appears in the document
        mockRoles.forEach((role) => {
            expect(screen.getByText(role.name)).toBeInTheDocument();
            expect(screen.getByText(role.password)).toBeInTheDocument();
        });
    });
    // Ensure clicking the delete button triggers the onDelete function with the correct role
    it("calls onDelete when delete button is clicked", () => {
        renderComponent();
        // Locate all delete buttons using test IDs
        const deleteButtons = mockRoles.map((role) => screen.getByTestId(`delete-${role.name}`));

        // Simulate clicking the delete button for each role
        deleteButtons.forEach((button, index) => {
            // Simulate clicking the delete button for each role
            fireEvent.click(button);
            // Ensure that onDelete is called with the correct role data
            expect(mockOnDelete).toHaveBeenCalledWith(mockRoles[index]);
        });
        expect(mockOnDelete).toHaveBeenCalledTimes(mockRoles.length);
    });
    // Ensure the component correctly handles an empty list of roles
    it("renders no roles when roles array is empty", () => {
        renderComponent({ roles: [] });
        // Confirm that no roles are displayed when the list is empty
        expect(screen.queryByText("Admin")).not.toBeInTheDocument();
        expect(screen.queryByText("User")).not.toBeInTheDocument();
    });
});
