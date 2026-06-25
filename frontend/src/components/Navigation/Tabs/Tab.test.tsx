import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tab, TabProps } from "./Tab";

describe("Tab Component", () => {
  const defaultTab = { id: 1, name: "Tab 1" };

  const renderTab = (props: Partial<TabProps> = {}) => {
    render(<Tab tab={defaultTab} active={false} {...props} />);
  };

  it("should render the tab name", () => {
    renderTab();

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
  });

  it("should apply active styles when active is true", () => {
    renderTab({ active: true });
    const tabElement = screen.getByText("Tab 1");

    expect(tabElement).toHaveClass("border-primary", "text-foreground");
    expect(tabElement).toHaveAttribute("aria-current", "page");
  });

  it("should apply inactive styles when active is false", () => {
    renderTab({ active: false });
    const tabElement = screen.getByText("Tab 1");

    expect(tabElement).toHaveClass("border-transparent", "text-gray-500");
    expect(tabElement).not.toHaveAttribute("aria-current");
  });

  it("should call onSelect with the correct id when clicked", () => {
    const handleSelect = vi.fn();
    renderTab({ onSelect: handleSelect });

    const tabElement = screen.getByText("Tab 1");

    fireEvent.click(tabElement);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it("should not throw an error if onSelect is not provided", () => {
    renderTab();
    const tabElement = screen.getByText("Tab 1");

    expect(() => fireEvent.click(tabElement)).not.toThrow();
  });
});
