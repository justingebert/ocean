import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProfileCard from "./ProfileCard";

// Tests for ProfileCard component to verify correct rendering behavior under different states
describe("ProfileCard Component", () => {
    // Mock user data used for testing profile card rendering
    const mockUser = {
        id: 1,
        username: "string",
        firstName: "string",
        lastName: "string",
        mail: "string",
        employeeType: "string",
    };
    // Ensure the profile card displays a loading skeleton when loading is true
    it("renders loading state correctly", () => {
        const { container } = render(<ProfileCard loading={true} />);
        // Verify that the loading animation is rendered in the document
        expect(container.querySelector(".animate-pulse.h-4.w-32.bg-gray-200")).toBeInTheDocument();
    });
    // Ensure the profile card correctly displays user information when loading is false
    it("renders the user details correctly", () => {
        const { container } = render(<ProfileCard user={mockUser} loading={false} />);
        // Select the element that displays the user's full name
        const fullNameElement = container.querySelector(".mt-1.text-sm.text-gray-900");
        // Verify that the correct full name is displayed
        expect(fullNameElement).toHaveTextContent("string string");
    });
    // Ensure the component displays fallback placeholders when user data is missing
    it("renders fallback text for missing user data", () => {
        render(<ProfileCard loading={false} user={undefined} />);
        // Verify that four placeholders ("..") are displayed for missing data fields
        expect(screen.getAllByText("..").length).toBe(4); // Four fallback texts for missing data
    });
});
