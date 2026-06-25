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

  it("renders icons with correct attributes", () => {
    render(<EmptyState {...props} />);

    const databaseIcon = document.querySelector("svg.mx-auto.h-12.w-12.text-gray-400");

    expect(databaseIcon).toBeInTheDocument();
    expect(databaseIcon).toHaveAttribute("aria-hidden", "true");
  });
});
