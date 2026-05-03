import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import DeleteModal, { DeleteModalProps } from "./DeleteModal";

// Tests for DeleteModal component to verify the submit button functionality
describe("DeleteModal Submit Button", () => {
    // Mock modal content data for testing the submit button behavior
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
    // Ensure clicking the delete button triggers the onSubmit function
    it("calls onSubmit when delete button is clicked", () => {
        // Create a mock function to track calls to onSubmit
        const onSubmitMock = vi.fn();
        renderComponent({ onSubmit: onSubmitMock });
        // Locate the delete button inside the modal
        const deleteButton = screen.getByText(modalContent.submitText);
        // Simulate clicking the delete button
        fireEvent.click(deleteButton);
        // Verify that onSubmit was called exactly once
        expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
});
