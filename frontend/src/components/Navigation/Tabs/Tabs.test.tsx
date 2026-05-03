import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tabs, TabsProps } from "./Tabs";

// Tests for Tabs component to verify correct rendering, styling, and interactions
describe("Tabs Component", () => {
    // Mock data representing a list of tabs for testing component rendering and interactions
    const defaultTabs = [
        { id: 1, name: "Tab 1" },
        { id: 2, name: "Tab 2" },
        { id: 3, name: "Tab 3" },
    ];
    // Helper function to render the Tabs component with default or custom props
    const renderTabs = (props: Partial<TabsProps> = {}) => {
        render(
            <Tabs
                tabs={defaultTabs}
                activeId={1}
                onSelect={vi.fn()} // Replace jest.fn() with vi.fn()
                {...props}
            />
        );
    };
    // Ensure all provided tabs are rendered correctly
    it("should render the list of tabs", () => {
        renderTabs();
        // Verify that each tab name appears in the document
        defaultTabs.forEach((tab) => {
            expect(screen.getByText(tab.name)).toBeInTheDocument();
        });
    });
    // Ensure the correct styles are applied to the active tab
    it("should highlight the active tab", () => {
        renderTabs({ activeId: 2 });
        const activeTab = screen.getByText("Tab 2");
        // Verify that active tab styling is applied correctly
        expect(activeTab).toHaveClass("border-cyan-500", "text-cyan-600"); // Active styles
    });
    // Ensure clicking a tab triggers the onSelect function with the correct tab ID
    it("should call onSelect with the correct id when a tab is clicked", () => {
        // Create a mock function to track calls to onSelect
        const handleSelect = vi.fn();
        renderTabs({ onSelect: handleSelect });

        const tabToClick = screen.getByText("Tab 3");
        // Simulate clicking a tab
        fireEvent.click(tabToClick);
        // Ensure the correct tab ID is passed to onSelect
        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith(3);
    });
    // Ensure clicking a tab does not throw an error when onSelect is undefined
    it("should not throw an error if onSelect is not provided", () => {
        renderTabs({ onSelect: undefined });

        const tabToClick = screen.getByText("Tab 1");
        // Confirm that clicking the tab without an onSelect handler does not cause errors
        expect(() => fireEvent.click(tabToClick)).not.toThrow();
    });
    // Ensure the component correctly handles an empty list of tabs
    it("should render an empty state when no tabs are provided", () => {
        renderTabs({ tabs: [] });
        // Verify that no tabs are rendered when an empty list is provided
        expect(screen.queryAllByRole("tab")).toHaveLength(0);
    });
});
