import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stats } from "./Stats";

describe("Stats Component", () => {
  it("renders the stat name and value correctly", () => {
    const mockName = "Total Users";
    const mockValue = "12345";

    render(<Stats name={mockName} value={mockValue} />);

    expect(screen.getByText(mockName)).toBeInTheDocument();

    expect(screen.getByText(mockValue)).toBeInTheDocument();
  });

  it("applies correct classes for styling", () => {
    const mockName = "Revenue";
    const mockValue = "$1,000,000";

    const { container } = render(<Stats name={mockName} value={mockValue} />);

    const statElement = container.querySelector(".shadow.rounded-lg");

    expect(statElement).toBeInTheDocument();
    expect(statElement).toHaveClass("px-4", "py-5", "bg-white", "shadow", "rounded-lg");
  });

  it("renders a snapshot of the component", () => {
    const mockName = "Active Users";
    const mockValue = "234";

    const { asFragment } = render(<Stats name={mockName} value={mockValue} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
