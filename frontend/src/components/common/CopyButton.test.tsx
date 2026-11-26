import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./CopyButton";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockClipboard = (writeText: () => Promise<void>) => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
};

describe("CopyButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("copies the value and confirms in place for a moment", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    render(<CopyButton value="secret" aria-label="Copy password" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy password" }));
    });

    expect(writeText).toHaveBeenCalledWith("secret");
    expect(screen.getByText("Copied")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
  });

  it("shows an error toast when copying fails", async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<CopyButton value="secret" aria-label="Copy password" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy password" }));
    });

    expect(toast.error).toHaveBeenCalledWith("Couldn't copy to the clipboard");
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
  });
});
