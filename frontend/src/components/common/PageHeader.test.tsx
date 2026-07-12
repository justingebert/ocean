import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title as a level-1 heading", () => {
    render(<PageHeader title="Databases" />);
    expect(screen.getByRole("heading", { level: 1, name: "Databases" })).toBeInTheDocument();
  });

  it("renders the optional description", () => {
    render(<PageHeader title="Databases" description="Manage your databases." />);
    expect(screen.getByText("Manage your databases.")).toBeInTheDocument();
  });

  it("omits the description when not provided", () => {
    const { container } = render(<PageHeader title="Databases" />);
    expect(container.querySelector("p")).toBeNull();
  });
});
