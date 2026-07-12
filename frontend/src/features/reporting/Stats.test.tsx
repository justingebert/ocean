import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stats } from "./Stats";

describe("Stats", () => {
  it("renders the stat name and value", () => {
    render(<Stats name="Total Users" value="12345" />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
  });
});
