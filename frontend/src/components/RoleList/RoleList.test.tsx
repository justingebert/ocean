import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RoleList, { RoleListProps } from "./RoleList";
import { RoleProperties } from "../../types/role";

vi.mock("./RoleListEntry", () => ({
  default: ({ role, onDelete }: { role: RoleProperties; onDelete: () => void }) => (
    <tr>
      <td>{role.name}</td>
      <td>{role.password}</td>
      <td>
        <button onClick={onDelete} data-testid={`delete-${role.name}`}>
          Delete
        </button>
      </td>
    </tr>
  ),
}));

const mockRoles = [
  { id: 1, instanceId: 123, name: "Admin", password: "admin123" },
  { id: 2, instanceId: 456, name: "User", password: "user123" },
];

const mockOnDelete = vi.fn();

const renderComponent = (props: Partial<RoleListProps> = {}) => {
  const defaultProps: RoleListProps = {
    roles: mockRoles,
    onDelete: mockOnDelete,
    ...props,
  };

  render(<RoleList {...defaultProps} />);
};

describe("RoleList Component", () => {
  it("renders the table headers correctly", () => {
    renderComponent();

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders the list of roles", () => {
    renderComponent();

    mockRoles.forEach((role) => {
      expect(screen.getByText(role.name)).toBeInTheDocument();
      expect(screen.getByText(role.password)).toBeInTheDocument();
    });
  });

  it("calls onDelete when delete button is clicked", () => {
    renderComponent();

    const deleteButtons = mockRoles.map((role) => screen.getByTestId(`delete-${role.name}`));

    deleteButtons.forEach((button, index) => {
      fireEvent.click(button);

      expect(mockOnDelete).toHaveBeenCalledWith(mockRoles[index]);
    });
    expect(mockOnDelete).toHaveBeenCalledTimes(mockRoles.length);
  });

  it("renders no roles when roles array is empty", () => {
    renderComponent({ roles: [] });

    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(screen.queryByText("User")).not.toBeInTheDocument();
  });
});
