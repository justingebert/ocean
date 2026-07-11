import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoadingRoute from "./LoadingRoute";

describe("LoadingRoute", () => {
  it("renders a page skeleton independent from session validation", () => {
    const { container } = render(<LoadingRoute />);

    expect(screen.getByRole("status", { name: /loading page/i })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="skeleton"]')).not.toHaveLength(0);
  });
});
