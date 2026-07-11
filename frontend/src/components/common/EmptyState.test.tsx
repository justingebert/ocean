import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmptyState, { EmptyStateProps } from "./EmptyState";

describe("EmptyState Component", () => {
  const mockOnClick = vi.fn();

  const props: EmptyStateProps = {
    title: "No Data Found",
    description: "It seems like there is no data available. Add new data to get started.",
    buttonText: "Add Data",
    onClick: mockOnClick,
  };

  it("renders correctly with given props", () => {
    render(<EmptyState {...props} />);

    expect(screen.getByText("No Data Found")).toBeInTheDocument();

    expect(
      screen.getByText("It seems like there is no data available. Add new data to get started."),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /add data/i })).toBeInTheDocument();
  });

  it("calls the onClick handler when the button is clicked", () => {
    render(<EmptyState {...props} />);

    const button = screen.getByRole("button", { name: /add data/i });

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("uses the shared empty-state composition with decorative icons", () => {
    const { container } = render(<EmptyState {...props} />);

    expect(container.querySelector('[data-slot="empty"]')).toBeInTheDocument();

    const icons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons).toHaveLength(2);
  });
});
