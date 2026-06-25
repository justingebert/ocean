import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RoleListEntry from "./RoleListEntry";

type RoleListEntryProps = React.ComponentProps<typeof RoleListEntry>;

describe("RoleListEntry Component", () => {
  const mockRole = { id: 1, instanceId: 123, name: "Admin", password: "admin123" };

  const mockOnDelete = vi.fn();

  const renderComponent = (props: Partial<RoleListEntryProps> = {}) => {
    const defaultProps: RoleListEntryProps = {
      role: mockRole,
      onDelete: mockOnDelete,
      ...props,
    };
    return render(
      <table>
        <tbody>
          <RoleListEntry {...defaultProps} />
        </tbody>
      </table>,
    );
  };

  it('renders the role name and "show" button initially', () => {
    renderComponent();

    expect(screen.getByText(mockRole.name)).toBeInTheDocument();

    expect(screen.getByText("show")).toBeInTheDocument();

    expect(screen.queryByText(mockRole.password)).not.toBeInTheDocument();
  });

  it('toggles the password visibility when "show" and "hide" are clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText("show"));

    expect(screen.getByText(mockRole.password)).toBeInTheDocument();

    expect(screen.getByText("hide")).toBeInTheDocument();

    fireEvent.click(screen.getByText("hide"));

    expect(screen.queryByText(mockRole.password)).not.toBeInTheDocument();
    expect(screen.getByText("show")).toBeInTheDocument();
  });

  it('calls onDelete with the correct role when "Delete" is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText("Delete"));

    expect(mockOnDelete).toHaveBeenCalledTimes(1);

    expect(mockOnDelete).toHaveBeenCalledWith(mockRole);
  });
});
