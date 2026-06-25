import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserSelector from "./UserSelector";
import { UserProperties } from "../../types/user";

describe("UserSelector", () => {
  const mockOnSelect = vi.fn();

  const mockOnDeselect = vi.fn();

  const users: UserProperties[] = [
    {
      id: 1,
      username: "john.doe",
      firstName: "John",
      lastName: "Doe",
      mail: "john.doe@example.com",
      employeeType: "full-time",
    },
    {
      id: 2,
      username: "jane.doe",
      firstName: "Jane",
      lastName: "Doe",
      mail: "jane.doe@example.com",
      employeeType: "part-time",
    },
  ];

  const selectedUserIds: number[] = [1];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the UserSelector component with a list of users", () => {
    render(
      <UserSelector
        users={users}
        selectedUserIds={selectedUserIds}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />,
    );

    expect(screen.getByText("Select to invite")).toBeInTheDocument();

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onSelect when a user is selected", () => {
    render(
      <UserSelector
        users={users}
        selectedUserIds={[]}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    const userOption = screen.getByText("john.doe");
    fireEvent.click(userOption);

    expect(mockOnSelect).toHaveBeenCalledWith(users[0]);
    expect(mockOnDeselect).not.toHaveBeenCalled();
  });

  it("calls onDeselect when a selected user is deselected", () => {
    render(
      <UserSelector
        users={users}
        selectedUserIds={selectedUserIds}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    const userOption = screen.getByText("john.doe");
    fireEvent.click(userOption);

    expect(mockOnDeselect).toHaveBeenCalledWith(users[0]);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("calls onSelect when the correct user is selected", () => {
    render(
      <UserSelector
        users={users}
        selectedUserIds={[]}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    const options = screen.getAllByText("J. Doe");

    const targetOption = options.find((option) => option.nextSibling?.textContent === "john.doe");
    expect(targetOption).toBeInTheDocument();

    fireEvent.click(targetOption!);

    expect(mockOnSelect).toHaveBeenCalledWith(users[0]);
  });

  it("calls onDeselect when an already selected user is clicked", () => {
    render(
      <UserSelector
        users={users}
        selectedUserIds={[1]}
        onSelect={mockOnSelect}
        onDeselect={mockOnDeselect}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    const options = screen.getAllByText("J. Doe");
    const targetOption = options.find((option) => option.nextSibling?.textContent === "john.doe");
    expect(targetOption).toBeInTheDocument();

    fireEvent.click(targetOption!);

    expect(mockOnDeselect).toHaveBeenCalledWith(users[0]);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("does nothing if onSelect and onDeselect are undefined", () => {
    render(
      <UserSelector
        users={users}
        selectedUserIds={[1]}
        onSelect={undefined}
        onDeselect={undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    const options = screen.getAllByText("J. Doe");
    const targetOption = options.find((option) => option.nextSibling?.textContent === "john.doe");
    expect(targetOption).toBeInTheDocument();

    fireEvent.click(targetOption!);

    expect(mockOnSelect).not.toHaveBeenCalled();

    expect(mockOnDeselect).not.toHaveBeenCalled();
  });
});
