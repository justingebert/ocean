import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // Ensure this is imported
import { describe, it, expect } from "vitest";
import Headline, { HeadlineProps } from "./Headline";

// Tests for Headline component to verify rendering and correct application of styles
describe("Headline Component", () => {
    // Helper function to render the Headline component with given props
    const renderHeadline = (props: HeadlineProps) => render(<Headline {...props} />);
    // Ensure the component renders correctly with a given title
    it("renders without crashing", () => {
        // Verify that the provided title appears in the document
        const props: HeadlineProps = { title: "Test Title", size: "medium" };
        renderHeadline(props);
        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
    // Ensure the small-sized headline applies the correct CSS classes
    it("renders the small headline with the correct class", () => {
        const props: HeadlineProps = { title: "Small Title", size: "small" };
        renderHeadline(props);
        const element = screen.getByText("Small Title");
        // Verify that the small headline contains the expected styling classes
        expect(element).toHaveClass("text-l text-gray-600 sm:text-xl mb-1");
    });
    // Ensure the medium-sized headline applies the correct CSS classes
    it("renders the medium headline with the correct class", () => {
        const props: HeadlineProps = { title: "Medium Title", size: "medium" };
        renderHeadline(props);
        // Verify that the medium headline contains the expected styling classes
        const element = screen.getByText("Medium Title");
        expect(element).toHaveClass("text-xl text-gray-600 sm:text-2xl mb-3");
    });
    // Ensure the large-sized headline applies the correct CSS classes
    it("renders the large headline with the correct class", () => {
        const props: HeadlineProps = { title: "Large Title", size: "large" };
        renderHeadline(props);
        // Verify that the large headline contains the expected styling classes
        const element = screen.getByText("Large Title");
        expect(element).toHaveClass("text-3xl text-gray-600 sm:text-4xl mb-5");
    });
});
