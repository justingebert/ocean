import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthLoadingScreen } from "./AuthLoadingScreen";

describe("AuthLoadingScreen", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("only reveals the session indicator when validation takes noticeable time", () => {
    vi.useFakeTimers();
    render(<AuthLoadingScreen />);

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(200));

    expect(screen.getByRole("status", { name: /checking session/i })).toBeInTheDocument();
  });
});
