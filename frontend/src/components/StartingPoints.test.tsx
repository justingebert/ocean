import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import StartingPoints, { StartingPointsProps } from "./StartingPoints";

// Mock data representing different starting points with titles, descriptions, links, and icons
const mockStartingPoints = [
    {
        title: "Feature A",
        description: "Description for Feature A",
        to: "/feature-a",
        icon: (props: React.SVGProps<SVGSVGElement>) => (
            <svg {...props}>
                <circle cx="12" cy="12" r="10" />
            </svg>
        ),
        background: "bg-blue-500",
    },
    {
        title: "Feature B",
        description: "Description for Feature B",
        to: "/feature-b",
        icon: (props: React.SVGProps<SVGSVGElement>) => (
            <svg {...props}>
                <rect x="4" y="4" width="16" height="16" />
            </svg>
        ),
        background: "bg-green-500",
    },
];
// Default props used for rendering the StartingPoints component in tests
const defaultProps: StartingPointsProps = {
    title: "Getting Started",
    description: "Explore the starting points to get familiar with the application.",
    startingPoints: mockStartingPoints,
    moreHref: "https://example.com",
};
// Helper function to render the StartingPoints component within a BrowserRouter
const renderComponent = (props = defaultProps) => {
    return render(
        <BrowserRouter>
            <StartingPoints {...props} />
        </BrowserRouter>
    );
};
// Tests for StartingPoints component to verify correct rendering, links, and interactions
describe("StartingPoints Component", () => {
    // Ensure the component correctly displays the main title and description
    it("renders the title and description", () => {
        renderComponent();
        // Verify that the main title appears in the document
        expect(screen.getByText("Getting Started")).toBeInTheDocument();
        // Verify that the main description is rendered correctly
        expect(
            screen.getByText("Explore the starting points to get familiar with the application.")
        ).toBeInTheDocument();
    });
    // Ensure that all starting points are displayed with their respective titles and descriptions
    it("renders the starting points with correct data", () => {
        renderComponent();
        // Verify that each starting point title appears in the document
        mockStartingPoints.forEach((point) => {
            expect(screen.getByText(point.title)).toBeInTheDocument();
            // Verify that each starting point description is displayed correctly
            expect(screen.getByText(point.description)).toBeInTheDocument();
        });
    });
    // Ensure that each starting point title is linked to the correct URL
    it("renders links with the correct hrefs", () => {
        renderComponent();
        mockStartingPoints.forEach((point) => {
            // Locate the nearest anchor element associated with the starting point title
            const linkElement = screen.getByText(point.title).closest("a");
            // Verify that the anchor element's href attribute matches the expected URL
            expect(linkElement).toHaveAttribute("href", point.to);
        });
    });
    // Ensure that the "Or ask a question" link is rendered with the correct URL and attributes
    it("renders the 'more' link correctly", () => {
        renderComponent();
        const moreLink = screen.getByText(/Or ask a question/i);
        // Verify that the "more" link points to the expected URL
        expect(moreLink).toHaveAttribute("href", defaultProps.moreHref);
        // Ensure that the "more" link opens in a new tab
        expect(moreLink).toHaveAttribute("target", "_blank");
    });
});
