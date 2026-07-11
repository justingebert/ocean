import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatabaseUsersPanel } from "./DatabaseUsersPanel.tsx";
import { RoleProperties } from "@/types/role.ts";

const roles: RoleProperties[] = [
  {
    id: 7,
    instanceId: 3,
    name: "reader",
    password: "secret-password",
  },
];

describe("<DatabaseUsersPanel />", () => {
  it("renders roles in a table", () => {
    render(
      <DatabaseUsersPanel
        roles={roles}
        isCreatingRole={false}
        onAddUser={vi.fn()}
        onDeleteRole={vi.fn()}
      />,
    );

    const table = screen.getByRole("table");

    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("reader")).toBeInTheDocument();
  });

  it("shows and hides a role password with buttons", async () => {
    const user = userEvent.setup();

    render(
      <DatabaseUsersPanel
        roles={roles}
        isCreatingRole={false}
        onAddUser={vi.fn()}
        onDeleteRole={vi.fn()}
      />,
    );

    const password = screen.getByLabelText("Password for reader");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password for reader" }));

    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password for reader" }));

    expect(password).toHaveAttribute("type", "password");
  });

  it("deletes the selected role with a button", async () => {
    const user = userEvent.setup();
    const onDeleteRole = vi.fn();

    render(
      <DatabaseUsersPanel
        roles={roles}
        isCreatingRole={false}
        onAddUser={vi.fn()}
        onDeleteRole={onDeleteRole}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDeleteRole).toHaveBeenCalledWith(7);
  });
});
