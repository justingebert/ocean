import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tab, TabProps } from "./Tab";
// Tests for Tab component to verify correct rendering, styling, and interactions
describe("Tab Component", () => {
    // Mock tab data representing a single tab entry for testing
    const defaultTab = { id: 1, name: "Tab 1" };
    // Helper function to render the Tab component with default or custom props
    const renderTab = (props: Partial<TabProps> = {}) => {
        render(<Tab tab={defaultTab} active={false} {...props} />);
    };
    // Ensure the tab name is displayed correctly
    it("should render the tab name", () => {
        renderTab();
        // Verify that the tab name is rendered in the document
        expect(screen.getByText("Tab 1")).toBeInTheDocument();
    });
    // Ensure the correct styles are applied when the tab is active
    it("should apply active styles when active is true", () => {
        renderTab({ active: true });
        const tabElement = screen.getByText("Tab 1");
        // Verify that active tab styling is applied
        expect(tabElement).toHaveClass("border-cyan-500", "text-cyan-600");
        expect(tabElement).toHaveAttribute("aria-current", "page");
    });
    // Ensure the correct styles are applied when the tab is inactive
    it("should apply inactive styles when active is false", () => {
        renderTab({ active: false });
        const tabElement = screen.getByText("Tab 1");
        // Verify that inactive tab styling is applied
        expect(tabElement).toHaveClass("border-transparent", "text-gray-500");
        expect(tabElement).not.toHaveAttribute("aria-current");
    });
    // Ensure clicking a tab triggers the onSelect function with the correct tab ID
    it("should call onSelect with the correct id when clicked", () => {
        // Create a mock function to track calls to onSelect
        const handleSelect = vi.fn();
        renderTab({ onSelect: handleSelect });

        const tabElement = screen.getByText("Tab 1");
        // Simulate a click event on the tab
        fireEvent.click(tabElement);
        // Ensure the correct tab ID is passed to onSelect
        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith(1);
    });
    // Ensure the component remains stable when onSelect is not provided
    it("should not throw an error if onSelect is not provided", () => {
        renderTab();
        const tabElement = screen.getByText("Tab 1");

        // Confirm that clicking the tab without an onSelect handler does not cause errors
        expect(() => fireEvent.click(tabElement)).not.toThrow();
    });
});
