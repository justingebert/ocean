import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ActionDropdown from "./ActionDropdown.tsx";

describe("ActionDropdown", () => {
  it("calls onDelete when Delete is selected", async () => {
    const onDelete = vi.fn();
    render(<ActionDropdown onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "Database actions" }));
    await userEvent.click(await screen.findByText("Delete database"));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
