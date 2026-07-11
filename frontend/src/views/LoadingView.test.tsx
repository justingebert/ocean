import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoadingView from "./LoadingView";

describe("LoadingView", () => {
  it("renders a page skeleton independent from session validation", () => {
    const { container } = render(<LoadingView />);

    expect(screen.getByRole("status", { name: /loading page/i })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="skeleton"]')).not.toHaveLength(0);
  });
});
