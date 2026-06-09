/* This example requires Tailwind CSS v2.0+ */
import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";

/**
 * Defines the available alert variants.
 */
export type AlertVariant = "primary" | "success" | "danger" | "warning";
/**
 * Props for the `Alert` component.
 */
export interface AlertProps {
  /**
   * The alert message to display.
   */
  message: string;
  /**
   * The alert title to display.
   * @default ""
   */
  title?: string;
  /**
   * Sets which variant should be displayed.
   * @default "primary"
   */
  variant?: AlertVariant;
}
/**
 * Displays an alert box with a specific variant.
 * - Supports `"primary"`, `"success"`, `"danger"`, and `"warning"` variants.
 * - Uses Tailwind CSS for styling.
 *
 * @param message - The message to display inside the alert.
 * @param title - The optional title for the alert.
 * @param variant - The type of alert to display (e.g., `"primary"`, `"success"`).
 */
export const Alert: React.FC<AlertProps> = ({ message, title = "", variant = "primary" }) => {
  /**
   * Renders the appropriate icon based on the alert variant.
   *
   * @returns A React element representing the variant-specific icon.
   */
  const renderIcon = (): React.ReactElement => {
    const common = `h-5 w-5 ${iconStyles[variant]}`;
    if (variant === "primary") {
      return <InformationCircleIcon className={common} aria-hidden="true" />;
    } else if (variant === "success") {
      return <CheckCircleIcon className={common} aria-hidden="true" />;
    } else if (variant === "danger") {
      return <XCircleIcon className={common} aria-hidden="true" />;
    } else if (variant === "warning") {
      return <ExclamationTriangleIcon className={common} aria-hidden="true" />;
    } else {
      const assertNever = (_: never): React.ReactElement => <></>;
      return assertNever(variant);
    }
  };

  return (
    <div className={`rounded-md p-4 ${backgroundStyles[variant]}`}>
      <div className="flex">
        <div className="flex-shrink-0">{renderIcon()}</div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${textStyles[variant]}`}>{title}</h3>
          <div className={`mt-2 text-sm ${textStyles[variant]}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * Background color styles based on alert variant.
 */
const backgroundStyles: Record<AlertVariant, string> = {
  primary: "bg-blue-50",
  success: "bg-green-50",
  danger: "bg-red-50",
  warning: "bg-yellow-50",
};
/**
 * Text color styles based on alert variant.
 */
const textStyles: Record<AlertVariant, string> = {
  primary: "text-blue-700",
  success: "text-green-700",
  danger: "text-red-700",
  warning: "text-yellow-700",
};
/**
 * Icon color styles based on alert variant.
 */
const iconStyles: Record<AlertVariant, string> = {
  primary: "text-blue-400",
  success: "text-green-400",
  danger: "text-red-400",
  warning: "text-yellow-400",
};
