import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, AlertProps } from "./Alert";

// Tests for Alert component to ensure proper rendering and behavior
describe("Alert Component", () => {
    // Helper function to render the Alert component with default or custom props
    const renderComponent = (props: Partial<AlertProps> = {}) => {
        // Default props used for rendering the Alert component in tests
        const defaultProps: AlertProps = {
            message: "This is an alert message.",
            title: "Alert Title",
            variant: "primary",
            ...props,
        };
        return render(<Alert {...defaultProps} />);
    };
    // Ensure the correct icon color appears when the primary variant is used
    it("renders the correct icon for the primary variant", () => {
        renderComponent({ variant: "primary" });
        // Select the icon element that represents the primary alert style
        const icon = document.querySelector(".text-blue-400");
        expect(icon).toBeInTheDocument();
    });
    // Ensure the correct icon color appears when the success variant is used
    it("renders the correct icon for the success variant", () => {
        renderComponent({ variant: "success" });

        const icon = document.querySelector(".text-green-400");
        expect(icon).toBeInTheDocument();
    });
    // Ensure the correct icon color appears when the danger variant is used
    it("renders the correct icon for the danger variant", () => {
        renderComponent({ variant: "danger" });

        const icon = document.querySelector(".text-red-400");
        expect(icon).toBeInTheDocument();
    });
    // Ensure the correct icon color appears when the warning variant is used
    it("renders the correct icon for the warning variant", () => {
        renderComponent({ variant: "warning" });

        const icon = document.querySelector(".text-yellow-400");
        expect(icon).toBeInTheDocument();
    });
    // Ensure the component renders correctly but without an icon when given an invalid variant
    it("renders the alert structure without an icon for an unsupported variant", () => {
        const invalidVariant = "unsupported" as AlertProps["variant"];

        const { container } = renderComponent({ variant: invalidVariant });
        // Select the icon container to verify that it is empty for unsupported variants
        const iconContainer = container.querySelector(".flex-shrink-0");
        expect(iconContainer).toBeEmptyDOMElement();
        // Ensure the alert box still renders properly without an icon
        expect(container.querySelector(".rounded-md")).toBeInTheDocument();
        expect(container.querySelector(".text-sm.font-medium")).toHaveTextContent("Alert Title");
        expect(container.querySelector(".mt-2.text-sm")).toHaveTextContent("This is an alert message.");
    });
    // Ensure that the primary variant is applied when no variant is explicitly provided
    it("uses the default variant (primary) when no variant is provided", () => {
        renderComponent({ variant: undefined });

        const icon = document.querySelector(".text-blue-400");
        expect(icon).toBeInTheDocument();
        // Verify that the alert container has the primary background color
        const alertContainer = document.querySelector(".bg-blue-50");
        expect(alertContainer).toBeInTheDocument();
    });
    // Ensure that the alert can render without a title if omitted
    it("renders without a title if none is provided", () => {
        renderComponent({ title: undefined });
        // Verify that the title element does not exist in the document
        const titleElement = screen.queryByText("Alert Title");
        expect(titleElement).not.toBeInTheDocument();
    });
    // Ensure the component falls back to default title and primary variant if both are omitted
    it("renders with default title and variant when both are omitted", () => {
        renderComponent({ message: "Test message" });

        const icon = document.querySelector(".text-blue-400");
        expect(icon).toBeInTheDocument();

        const alertContainer = document.querySelector(".bg-blue-50");
        expect(alertContainer).toBeInTheDocument();
    });
});
