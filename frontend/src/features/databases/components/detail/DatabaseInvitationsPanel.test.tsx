import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatabaseInvitationsPanel } from "./DatabaseInvitationsPanel.tsx";
import { UserProperties } from "@/types/user.ts";

const users: UserProperties[] = [
  {
    id: 1,
    username: "ada",
    firstName: "Ada",
    lastName: "Lovelace",
    mail: "ada@example.com",
    employeeType: "student",
  },
  {
    id: 2,
    username: "grace",
    firstName: "Grace",
    lastName: "Hopper",
    mail: "grace@example.com",
    employeeType: "student",
  },
];

function renderPanel({ selectedUserIds = [] }: { selectedUserIds?: number[] } = {}) {
  const onSelectUser = vi.fn();
  const onDeselectUser = vi.fn();

  render(
    <DatabaseInvitationsPanel
      users={users}
      invitedUsers={[]}
      selectedUserIds={selectedUserIds}
      onSelectUser={onSelectUser}
      onDeselectUser={onDeselectUser}
    />,
  );

  return { onSelectUser, onDeselectUser };
}

describe("DatabaseInvitationsPanel", () => {
  it("filters users by username", async () => {
    const user = userEvent.setup();
    renderPanel();

    const input = screen.getByRole("combobox", { name: "Select to invite" });
    await user.click(input);
    await user.type(input, "grace");

    expect(await screen.findByRole("option", { name: /G\. Hopper grace/ })).toBeVisible();
    expect(screen.queryByRole("option", { name: /A\. Lovelace ada/ })).not.toBeInTheDocument();
  });

  it("invites an unselected user", async () => {
    const user = userEvent.setup();
    const { onSelectUser, onDeselectUser } = renderPanel();

    await user.click(screen.getByRole("combobox", { name: "Select to invite" }));
    await user.click(await screen.findByRole("option", { name: /A\. Lovelace ada/ }));

    expect(onSelectUser).toHaveBeenCalledWith(1);
    expect(onDeselectUser).not.toHaveBeenCalled();
  });

  it("removes a selected user", async () => {
    const user = userEvent.setup();
    const { onSelectUser, onDeselectUser } = renderPanel({ selectedUserIds: [1] });

    await user.click(screen.getByRole("combobox", { name: "Select to invite" }));
    await user.click(await screen.findByRole("option", { name: /A\. Lovelace ada/ }));

    expect(onDeselectUser).toHaveBeenCalledWith(1);
    expect(onSelectUser).not.toHaveBeenCalled();
  });
});
