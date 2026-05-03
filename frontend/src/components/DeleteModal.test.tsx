import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import DeleteModal, { DeleteModalProps } from "./DeleteModal";

describe("DeleteModal Component", () => {
    // Mock modal content data for testing modal rendering and interactions
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
    // Clear all mock function calls before each test to ensure test isolation
    beforeEach(() => {
        vi.clearAllMocks();
    });
    // Ensure the modal is displayed with the correct content when open is true
    it("renders modal content when open is true", () => {
        renderComponent();
        // Verify that the modal title is displayed in the document
        expect(screen.getByText(modalContent.title)).toBeInTheDocument();
        // Ensure that the modal description text is visible
        expect(screen.getByText(modalContent.description)).toBeInTheDocument();
        // Confirm that the delete button text appears in the modal
        expect(screen.getByText(modalContent.submitText)).toBeInTheDocument();
        // Confirm that the cancel button text appears in the modal
        expect(screen.getByText(modalContent.cancelText)).toBeInTheDocument();
    });
    // Ensure the modal does not render when the open prop is set to false
    it("does not render modal when open is false", () => {
        renderComponent({ open: false });
        // Verify that the modal title is not present in the document when closed
        expect(screen.queryByText(modalContent.title)).not.toBeInTheDocument();
    });
});
