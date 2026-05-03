import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { InvitationList } from "./InvitationList";
import { IInvitedUser } from "./InvitationListEntry";

// Tests for InvitationList component to ensure proper rendering and user interactions
describe("<InvitationList />", () => {
    // Mock data representing invited users for testing component rendering and interactions
    const invitedUsers: IInvitedUser[] = [
        {
            id: 1,
            username: "username1",
            firstName: "firstName1",
            lastName: "lastName1",
            createdAt: new Date(),
            invitationId: 2,
        },
    ];
    // Ensure the component renders successfully without throwing errors
    it("renders without crashing", () => {
        // Render the InvitationList component with mock invited users
        render(<InvitationList invitedUsers={invitedUsers} />);
    });
    // Ensure clicking the delete button triggers the onDelete function with the correct user
    it("calls onDelete when delete action is triggered", () => {
        // Create a mock function to track calls to onDelete
        const mockOnDelete = vi.fn();
        render(<InvitationList invitedUsers={invitedUsers} onDelete={mockOnDelete} />);

        // Find the delete text element and click it
        const deleteElement = screen.getByText("Delete");
        // Simulate a click on the delete button
        fireEvent.click(deleteElement);

        // Verify that the onDelete function was called exactly once
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        // Ensure that the correct invited user was passed to the onDelete function
        expect(mockOnDelete).toHaveBeenCalledWith(invitedUsers[0]);
    });
});
