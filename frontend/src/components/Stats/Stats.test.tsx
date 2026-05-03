import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stats } from "./Stats";

// Tests for Stats component to ensure correct rendering, styling, and consistency
describe("Stats Component", () => {
    // Ensure the component correctly displays the provided name and value
    it("renders the stat name and value correctly", () => {
        // Arrange
        const mockName = "Total Users";
        const mockValue = "12345";

        // Act
        render(<Stats name={mockName} value={mockValue} />);

        // Verify that the stat name is displayed in the document
        expect(screen.getByText(mockName)).toBeInTheDocument();
        // Verify that the stat value is displayed in the document
        expect(screen.getByText(mockValue)).toBeInTheDocument();
    });
    // Ensure the component applies the correct Tailwind CSS classes for styling
    it("applies correct classes for styling", () => {
        // Select the main stat element to check its applied styles
        const mockName = "Revenue";
        const mockValue = "$1,000,000";

        // Act
        const { container } = render(<Stats name={mockName} value={mockValue} />);

        // Select the main stat element to check its applied styles
        const statElement = container.querySelector(".shadow.rounded-lg");
        // Verify that the stat container has the expected styling classes
        expect(statElement).toBeInTheDocument();
        expect(statElement).toHaveClass("px-4", "py-5", "bg-white", "shadow", "rounded-lg");
    });
    // Ensure the component's UI remains consistent by capturing a snapshot
    it("renders a snapshot of the component", () => {
        // Arrange
        const mockName = "Active Users";
        const mockValue = "234";

        // Render the Stats component and capture its fragment for snapshot testing
        const { asFragment } = render(<Stats name={mockName} value={mockValue} />);

        // Compare the current render output with the stored snapshot
        expect(asFragment()).toMatchSnapshot();
    });
});
