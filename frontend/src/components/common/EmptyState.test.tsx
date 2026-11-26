import { render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import EmptyState, { EmptyStateProps } from "./EmptyState";

const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

describe("EmptyState Component", () => {
  const props: EmptyStateProps = {
    title: "No Data Found",
    description: "It seems like there is no data available. Add new data to get started.",
    buttonText: "Add Data",
    to: "/data/new",
  };

  it("renders correctly with given props", () => {
    render(<EmptyState {...props} />);

    expect(screen.getByText("No Data Found")).toBeInTheDocument();

    expect(
      screen.getByText("It seems like there is no data available. Add new data to get started."),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /add data/i })).toBeInTheDocument();
  });

  it("links the button to the given path", () => {
    render(<EmptyState {...props} />);

    expect(screen.getByRole("link", { name: /add data/i })).toHaveAttribute("href", "/data/new");
  });

  it("uses the shared empty-state composition with decorative icons", () => {
    const { container } = render(<EmptyState {...props} />);

    expect(container.querySelector('[data-slot="empty"]')).toBeInTheDocument();

    const icons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons).toHaveLength(2);
  });
});
