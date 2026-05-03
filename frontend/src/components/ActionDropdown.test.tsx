import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ActionDropdown from "./ActionDropdown";

// Tests for ActionDropdown component to verify rendering and interactions
describe("ActionDropdown", () => {
    // Ensure the "Actions" button is displayed correctly
    it("renders the Actions button", () => {
        render(<ActionDropdown />);
        // Locate the dropdown button using an accessible role
        const button = screen.getByRole("button", { name: /actions/i });
        // Verify that the "Actions" button is present in the document
        expect(button).toBeInTheDocument();
    });
    // Ensure clicking the "Delete" option triggers the onDelete callback
    it("calls onDelete when Delete is clicked", () => {
        // Create a mock function to track calls to onDelete
        const onDeleteMock = vi.fn();
        render(<ActionDropdown onDelete={onDeleteMock} />);

        const button = screen.getByRole("button", { name: /actions/i });
        fireEvent.click(button); // Open dropdown

        const deleteOption = screen.getByText(/delete/i);
        // Simulate clicking the "Actions" button to open the dropdown menu
        fireEvent.click(deleteOption);
        // Verify that onDelete was called exactly once
        expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });
});
