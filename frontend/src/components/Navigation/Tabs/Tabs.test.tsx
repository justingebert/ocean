import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tabs, TabsProps } from "./Tabs";

describe("Tabs Component", () => {
  const defaultTabs = [
    { id: 1, name: "Tab 1" },
    { id: 2, name: "Tab 2" },
    { id: 3, name: "Tab 3" },
  ];

  const renderTabs = (props: Partial<TabsProps> = {}) => {
    render(<Tabs tabs={defaultTabs} activeId={1} onSelect={vi.fn()} {...props} />);
  };

  it("should render the list of tabs", () => {
    renderTabs();

    defaultTabs.forEach((tab) => {
      expect(screen.getByText(tab.name)).toBeInTheDocument();
    });
  });

  it("should highlight the active tab", () => {
    renderTabs({ activeId: 2 });
    const activeTab = screen.getByText("Tab 2");

    expect(activeTab).toHaveClass("border-cyan-500", "text-cyan-600");
  });

  it("should call onSelect with the correct id when a tab is clicked", () => {
    const handleSelect = vi.fn();
    renderTabs({ onSelect: handleSelect });

    const tabToClick = screen.getByText("Tab 3");

    fireEvent.click(tabToClick);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(3);
  });

  it("should not throw an error if onSelect is not provided", () => {
    renderTabs({ onSelect: undefined });

    const tabToClick = screen.getByText("Tab 1");

    expect(() => fireEvent.click(tabToClick)).not.toThrow();
  });

  it("should render an empty state when no tabs are provided", () => {
    renderTabs({ tabs: [] });

    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });
});
