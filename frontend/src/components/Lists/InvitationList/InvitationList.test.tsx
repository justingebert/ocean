import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { InvitationList } from "./InvitationList";
import { IInvitedUser } from "./InvitationListEntry";

describe("<InvitationList />", () => {
  const invitedUsers: IInvitedUser[] = [
    {
      id: 1,
      username: "username1",
      firstName: "firstName1",
      lastName: "lastName1",
      createdAt: new Date(),
      invitationId: 2,
    },
  ];

  it("renders without crashing", () => {
    render(<InvitationList invitedUsers={invitedUsers} />);
  });

  it("calls onDelete when delete action is triggered", () => {
    const mockOnDelete = vi.fn();
    render(<InvitationList invitedUsers={invitedUsers} onDelete={mockOnDelete} />);

    const deleteElement = screen.getByText("Delete");

    fireEvent.click(deleteElement);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);

    expect(mockOnDelete).toHaveBeenCalledWith(invitedUsers[0]);
  });
});
