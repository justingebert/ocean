import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import DeleteModal, { DeleteModalProps } from "./DeleteModal";

describe("DeleteModal Close Icon", () => {
  const modalContent = {
    title: "Delete Item",
    description: "Are you sure you want to delete this item? This action cannot be undone.",
    submitText: "Delete",
    cancelText: "Cancel",
  };

  const renderComponent = (props?: Partial<DeleteModalProps>) => {
    const defaultProps: DeleteModalProps = {
      modalContent,
      open: true,
      onSubmit: vi.fn(),
      onClose: vi.fn(),
    };

    return render(<DeleteModal {...defaultProps} {...props} />);
  };

  it("calls onClose when the close icon is clicked", async () => {
    const user = userEvent.setup();

    const onCloseMock = vi.fn();
    renderComponent({ onClose: onCloseMock });

    const closeButton = screen.getByRole("button", { name: /close/i });

    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
