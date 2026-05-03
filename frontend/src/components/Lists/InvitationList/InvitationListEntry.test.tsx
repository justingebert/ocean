import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InvitationListEntry, { InvitationListEntryProps } from "./InvitationListEntry";

// Mock data representing an invited user for testing component rendering and interactions
const mockInvitedUser = {
    id: 1,
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    createdAt: new Date(),
    invitationId: 123,
};

// Mock User.getDisplayName function to control its return value in tests
vi.mock("../../../types/user", () => ({
    User: {
        getDisplayName: vi.fn(({ firstName, lastName }) => `${firstName} ${lastName}`),
    },
}));
// Tests for InvitationListEntry component to ensure proper rendering and user interactions
describe("InvitationListEntry Component", () => {
    // Helper function to render the InvitationListEntry component with provided props
    const renderComponent = (props: InvitationListEntryProps) =>
        render(<InvitationListEntry {...props} />);
    // Ensure that the invited user's details are displayed correctly
    it("renders the invited user's details", () => {
        renderComponent({ invitedUser: mockInvitedUser });
        // Verify that the username is displayed in the component
        expect(screen.getByText("johndoe")).toBeInTheDocument();
    });
    // Ensure clicking the delete button triggers the onDelete function with the correct user
    it("calls onDelete when the Delete action is clicked", () => {
        // Create a mock function to track calls to onDelete
        const onDeleteMock = vi.fn();
        renderComponent({ invitedUser: mockInvitedUser, onDelete: onDeleteMock });
        // Locate the delete button in the rendered component
        const deleteButton = screen.getByText("Delete");
        // Simulate a click on the delete button
        fireEvent.click(deleteButton);
        // Verify that the onDelete function was called exactly once
        expect(onDeleteMock).toHaveBeenCalledTimes(1);
        expect(onDeleteMock).toHaveBeenCalledWith(mockInvitedUser);
    });
    // Ensure that the component does not break when the onDelete function is not provided
    it("handles missing onDelete gracefully", () => {
        renderComponent({ invitedUser: mockInvitedUser });

        const deleteButton = screen.getByText("Delete");
        // Simulate clicking the delete button when onDelete is not provided
        fireEvent.click(deleteButton);

        // Verify that the delete button still exists and no errors are thrown
        expect(screen.getByText("Delete")).toBeInTheDocument();
    });
});
