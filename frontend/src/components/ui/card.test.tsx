import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./card";

describe("Card", () => {
  it("renders content with the base surface classes", () => {
    render(<Card>Content</Card>);

    expect(screen.getByText("Content")).toHaveClass("bg-white", "shadow", "sm:rounded-lg");
  });

  it("merges custom classes", () => {
    render(<Card className="overflow-hidden">Content</Card>);

    expect(screen.getByText("Content")).toHaveClass("overflow-hidden");
  });
});
