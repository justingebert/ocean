import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmptyState, { EmptyStateProps } from "./EmptyState";

// Tests for EmptyState component to verify correct rendering, interactions, and icon display
describe("EmptyState Component", () => {
    // Mock function to track calls to the onClick handler
    const mockOnClick = vi.fn();
    // Default props for rendering the EmptyState component in tests
    const props: EmptyStateProps = {
        title: "No Data Found",
        description: "It seems like there is no data available. Add new data to get started.",
        buttonText: "Add Data",
        onClick: mockOnClick,
    };
    // Ensure the component correctly renders title, description, and button text
    it("renders correctly with given props", () => {
        render(<EmptyState {...props} />);
        // Verify that the title is displayed in the document
        expect(screen.getByText("No Data Found")).toBeInTheDocument();
        // Verify that the title is displayed in the document
        expect(
            screen.getByText("It seems like there is no data available. Add new data to get started.")
        ).toBeInTheDocument();
        // Ensure that the button is rendered with the correct text
        expect(screen.getByRole("button", { name: /add data/i })).toBeInTheDocument();
    });
    // Ensure clicking the button triggers the onClick function
    it("calls the onClick handler when the button is clicked", () => {
        render(<EmptyState {...props} />);
        // Locate the button inside the EmptyState component
        const button = screen.getByRole("button", { name: /add data/i });
        // Simulate clicking the button
        fireEvent.click(button);
        // Verify that onClick was called exactly once
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
    // Ensure that the correct icon is rendered with the expected attributes
    it("renders icons with correct attributes", () => {
        render(<EmptyState {...props} />);
        // Locate the icon inside the EmptyState component
        const databaseIcon = document.querySelector("svg.mx-auto.h-12.w-12.text-gray-400");
        // Verify that the icon has the correct accessibility attributes
        expect(databaseIcon).toBeInTheDocument();
        expect(databaseIcon).toHaveAttribute("aria-hidden", "true");
    });
});
