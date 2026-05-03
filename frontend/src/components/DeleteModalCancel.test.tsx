import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import DeleteModal, { DeleteModalProps } from "./DeleteModal";

// Tests for DeleteModal component to verify the functionality of the cancel button
describe("DeleteModal Cancel Button", () => {
    // Mock modal content data for testing cancel button behavior
    const modalContent = {
        title: "Delete Item",
        description: "Are you sure you want to delete this item? This action cannot be undone.",
        submitText: "Delete",
        cancelText: "Cancel",
    };
    // Helper function to render the DeleteModal component with default or custom props
    const renderComponent = (props?: Partial<DeleteModalProps>) => {
        const defaultProps: DeleteModalProps = {
            modalContent,
            open: true,
            onSubmit: vi.fn(),
            onClose: vi.fn(),
        };

        return render(<DeleteModal {...defaultProps} {...props} />);
    };
    // Ensure clicking the cancel button triggers the onClose function
    it("calls onClose when cancel button is clicked", () => {
        // Create a mock function to track calls to onClose
        const onCloseMock = vi.fn();
        renderComponent({ onClose: onCloseMock });
        // Locate the cancel button inside the modal
        const cancelButton = screen.getByText(modalContent.cancelText);
        // Simulate clicking the cancel button
        fireEvent.click(cancelButton);
        // Verify that onClose was called exactly once
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});
