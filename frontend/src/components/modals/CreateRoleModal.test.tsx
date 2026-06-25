import { render, screen } from "@testing-library/react";
import { describe, it, beforeEach, vi, expect } from "vitest";
import CreateRoleModal, { CreateRoleModalProps } from "./CreateRoleModal";
import { CreateRoleFormProps } from "../forms/CreateRoleForm";

vi.mock("../forms/CreateRoleForm", () => {
  return {
    default: vi.fn(({ onSubmit, onClose }: CreateRoleFormProps) => (
      <div data-testid="create-role-form">
        <button
          onClick={() => onSubmit({ roleName: "Admin", instanceId: 1 })}
          data-testid="submit-button"
        >
          Submit
        </button>
        <button onClick={onClose} data-testid="close-button">
          Close
        </button>
      </div>
    )),
  };
});

describe("CreateRoleModal", () => {
  const mockOnSubmit = vi.fn();

  const mockOnClose = vi.fn();

  const defaultProps: CreateRoleModalProps = {
    open: false,
    onSubmit: mockOnSubmit,
    onClose: mockOnClose,
  };

  const renderComponent = (props = {}) => {
    return render(<CreateRoleModal {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the modal when open is false", () => {
    renderComponent({ open: false });

    expect(screen.queryByText("Create a user")).not.toBeInTheDocument();

    expect(screen.queryByTestId("create-role-form")).not.toBeInTheDocument();
  });
});
