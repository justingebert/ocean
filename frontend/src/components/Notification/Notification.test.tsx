import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Notification, { NotificationProps } from "./Notification";

// Tests for Notification component to ensure correct rendering, behavior, and interactions
describe("Notification Component", () => {
    // Default properties used to render the Notification component in tests
    const defaultProps: NotificationProps = {
        show: true,
        title: "Test Notification",
        description: "This is a test description.",
        variant: "success",
        onClose: vi.fn(),
    };
    // Ensure the notification is visible when the show prop is set to true
    it("renders correctly when show is true", () => {
        render(<Notification {...defaultProps} />);
        // Verify that the notification title is displayed
        expect(screen.getByText("Test Notification")).toBeInTheDocument();
        expect(screen.getByText("This is a test description.")).toBeInTheDocument();
    });
    // Ensure the notification does not render when the show prop is set to false
    it("does not render when show is false", () => {
        render(<Notification {...defaultProps} show={false} />);
        // Confirm that the notification title is not present in the document
        expect(screen.queryByText("Test Notification")).not.toBeInTheDocument();
    });
    // Ensure clicking the close button triggers the onClose function
    it("calls onClose handler when close button is clicked", () => {
        const mockOnClose = vi.fn();
        render(<Notification {...defaultProps} onClose={mockOnClose} />);
        // Simulate a user clicking the close button
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        // Verify that the onClose function was called exactly once
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
    // Ensure the success icon is displayed when the variant is set to "success"
    it("renders the success icon for success variant", () => {
        const { container } = render(<Notification {...defaultProps} variant="success" />);
        // Select the success icon element and verify its presence
        const icon = container.querySelector(".text-green-400");
        expect(icon).toBeInTheDocument();
    });
    // Ensure the error icon is displayed when the variant is set to "error"
    it("renders the error icon for error variant", () => {
        const { container } = render(<Notification {...defaultProps} variant="error" />);
        // Select the error icon element and verify its presence
        const icon = container.querySelector(".text-red-400"); // Specific to ExclamationIcon
        expect(icon).toBeInTheDocument();
    });
    // Ensure the component renders correctly with default props
    it("renders with default props (variant='success')", () => {
        const defaultProps = {
            show: true,
            title: "Default Notification",
            description: "This is a default notification.",
            onClose: vi.fn(),
        };

        const { container } = render(<Notification {...defaultProps} />);

        // Verify that the title and description are displayed
        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
        expect(screen.getByText(defaultProps.description)).toBeInTheDocument();

        // Verify that the default success icon is displayed
        const icon = container.querySelector(".text-green-400"); // Specific to CheckCircleIcon
        expect(icon).toBeInTheDocument();
    });
});
