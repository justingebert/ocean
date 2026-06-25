import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, AlertProps } from "./Alert";

describe("Alert Component", () => {
  const renderComponent = (props: Partial<AlertProps> = {}) => {
    const defaultProps: AlertProps = {
      message: "This is an alert message.",
      title: "Alert Title",
      variant: "primary",
      ...props,
    };
    return render(<Alert {...defaultProps} />);
  };

  it("renders the correct icon for the primary variant", () => {
    renderComponent({ variant: "primary" });

    const icon = document.querySelector(".text-primary");
    expect(icon).toBeInTheDocument();
  });

  it("renders the correct icon for the success variant", () => {
    renderComponent({ variant: "success" });

    const icon = document.querySelector(".text-success");
    expect(icon).toBeInTheDocument();
  });

  it("renders the correct icon for the danger variant", () => {
    renderComponent({ variant: "danger" });

    const icon = document.querySelector(".text-destructive");
    expect(icon).toBeInTheDocument();
  });

  it("renders the correct icon for the warning variant", () => {
    renderComponent({ variant: "warning" });

    const icon = document.querySelector(".text-warning");
    expect(icon).toBeInTheDocument();
  });

  it("renders the alert structure without an icon for an unsupported variant", () => {
    const invalidVariant = "unsupported" as AlertProps["variant"];

    const { container } = renderComponent({ variant: invalidVariant });

    const iconContainer = container.querySelector(".flex-shrink-0");
    expect(iconContainer).toBeEmptyDOMElement();

    expect(container.querySelector(".rounded-md")).toBeInTheDocument();
    expect(container.querySelector(".text-sm.font-medium")).toHaveTextContent("Alert Title");
    expect(container.querySelector(".mt-2.text-sm")).toHaveTextContent("This is an alert message.");
  });

  it("uses the default variant (primary) when no variant is provided", () => {
    renderComponent({ variant: undefined });

    const icon = document.querySelector(".text-primary");
    expect(icon).toBeInTheDocument();

    const alertContainer = document.querySelector(".bg-accent");
    expect(alertContainer).toBeInTheDocument();
  });

  it("renders without a title if none is provided", () => {
    renderComponent({ title: undefined });

    const titleElement = screen.queryByText("Alert Title");
    expect(titleElement).not.toBeInTheDocument();
  });

  it("renders with default title and variant when both are omitted", () => {
    renderComponent({ message: "Test message" });

    const icon = document.querySelector(".text-primary");
    expect(icon).toBeInTheDocument();

    const alertContainer = document.querySelector(".bg-accent");
    expect(alertContainer).toBeInTheDocument();
  });
});
