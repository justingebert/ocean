import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserSelector from "./UserSelector"; // Adjust path as needed
import { UserProperties } from "../../types/user"; // Adjust path as needed

describe("UserSelector", () => {
    // Mock function to track calls to the onSelect handler
    const mockOnSelect = vi.fn();
    // Mock function to track calls to the onDeselect handler
    const mockOnDeselect = vi.fn();
    // Mock user data representing different employees for testing user selection
    const users: UserProperties[] = [
        {
            id: 1,
            username: "john.doe",
            firstName: "John",
            lastName: "Doe",
            mail: "john.doe@example.com",
            employeeType: "full-time",
        },
        {
            id: 2,
            username: "jane.doe",
            firstName: "Jane",
            lastName: "Doe",
            mail: "jane.doe@example.com",
            employeeType: "part-time",
        },
    ];
    // Pre-selected user IDs to simulate an already selected user
    const selectedUserIds: number[] = [1];
    // Clear all mock function calls before each test to ensure test isolation
    beforeEach(() => {
        vi.clearAllMocks(); // Replace jest.clearAllMocks() with vi.clearAllMocks()
    });
    // Ensure the UserSelector component renders correctly with a list of users
    it("renders the UserSelector component with a list of users", () => {
        render(
            <UserSelector
                users={users}
                selectedUserIds={selectedUserIds}
                onSelect={mockOnSelect}
                onDeselect={mockOnDeselect}
            />
        );
        // Verify that the dropdown label is displayed
        expect(screen.getByText("Select to invite")).toBeInTheDocument();
        // Confirm that the dropdown button exists
        expect(screen.getByRole("button")).toBeInTheDocument();
    });
    // Ensure selecting a user triggers the onSelect callback with the correct user
    it("calls onSelect when a user is selected", () => {
        render(
            <UserSelector
                users={users}
                selectedUserIds={[]}
                onSelect={mockOnSelect}
                onDeselect={mockOnDeselect}
            />
        );
        // Open the dropdown to display user options
        fireEvent.click(screen.getByRole("button"));
        // Locate the user option in the dropdown
        const userOption = screen.getByText("john.doe");
        fireEvent.click(userOption);
        // Verify that onSelect is called with the correct user object
        expect(mockOnSelect).toHaveBeenCalledWith(users[0]);
        expect(mockOnDeselect).not.toHaveBeenCalled();
    });
    // Ensure clicking an already selected user triggers the onDeselect callback
    it("calls onDeselect when a selected user is deselected", () => {
        render(
            <UserSelector
                users={users}
                selectedUserIds={selectedUserIds}
                onSelect={mockOnSelect}
                onDeselect={mockOnDeselect}
            />
        );
        // Open the dropdown to display user options
        fireEvent.click(screen.getByRole("button"));
        // Locate the selected user in the dropdown
        const userOption = screen.getByText("john.doe");
        fireEvent.click(userOption);
        // Verify that onDeselect is called with the correct user object
        expect(mockOnDeselect).toHaveBeenCalledWith(users[0]);
        expect(mockOnSelect).not.toHaveBeenCalled();
    });
    // Ensure selecting the correct user based on sibling text triggers onSelect
    it("calls onSelect when the correct user is selected", () => {
        render(
            <UserSelector
                users={users}
                selectedUserIds={[]} // No user is selected
                onSelect={mockOnSelect}
                onDeselect={mockOnDeselect}
            />
        );

        // Open the dropdown
        fireEvent.click(screen.getByRole("button"));
        // Locate all user options in the dropdown with initials
        const options = screen.getAllByText("J. Doe");
        // Find the correct option using sibling text content
        const targetOption = options.find((option) => option.nextSibling?.textContent === "john.doe");
        expect(targetOption).toBeInTheDocument();
        // Simulate selecting the correct user option
        fireEvent.click(targetOption!);
        // Verify that onSelect is triggered with the expected user
        expect(mockOnSelect).toHaveBeenCalledWith(users[0]);
    });

    it("calls onDeselect when an already selected user is clicked", () => {
        render(
            <UserSelector
                users={users}
                selectedUserIds={[1]} // User with ID 1 is already selected
                onSelect={mockOnSelect}
                onDeselect={mockOnDeselect}
            />
        );

        // Open the dropdown
        fireEvent.click(screen.getByRole("button"));

        // Find the correct option by sibling text
        const options = screen.getAllByText("J. Doe");
        const targetOption = options.find((option) => option.nextSibling?.textContent === "john.doe");
        expect(targetOption).toBeInTheDocument();

        // Click the option to trigger deselect
        fireEvent.click(targetOption!);

        // Verify onDeselect is called with the correct user
        expect(mockOnDeselect).toHaveBeenCalledWith(users[0]);
        expect(mockOnSelect).not.toHaveBeenCalled();
    });
    // Ensure that selecting or deselecting a user does not throw an error when handlers are undefined
    it("does nothing if onSelect and onDeselect are undefined", () => {
        render(
            <UserSelector
                users={users}
                selectedUserIds={[1]} // User with ID 1 is already selected
                onSelect={undefined}
                onDeselect={undefined}
            />
        );

        // Open the dropdown
        fireEvent.click(screen.getByRole("button"));

        // Find the correct option by sibling text
        const options = screen.getAllByText("J. Doe");
        const targetOption = options.find((option) => option.nextSibling?.textContent === "john.doe");
        expect(targetOption).toBeInTheDocument();

        // Click the option
        fireEvent.click(targetOption!);
        // Verify that onSelect was not called when undefined
        expect(mockOnSelect).not.toHaveBeenCalled();
        // Verify that onDeselect was not called when undefined
        expect(mockOnDeselect).not.toHaveBeenCalled();
    });
});
