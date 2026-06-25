import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import DeleteModal, { DeleteModalProps } from "./DeleteModal";

describe("DeleteModal Submit Button", () => {
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

  it("calls onSubmit when delete button is clicked", async () => {
    const user = userEvent.setup();

    const onSubmitMock = vi.fn();
    renderComponent({ onSubmit: onSubmitMock });

    const deleteButton = screen.getByText(modalContent.submitText);

    await user.click(deleteButton);

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
});
