import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";

export type AlertVariant = "primary" | "success" | "danger" | "warning";

export interface AlertProps {
  message: string;

  title?: string;

  variant?: AlertVariant;
}

export const Alert: React.FC<AlertProps> = ({ message, title = "", variant = "primary" }) => {
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

const backgroundStyles: Record<AlertVariant, string> = {
  primary: "bg-accent",
  success: "bg-success/10",
  danger: "bg-destructive/10",
  warning: "bg-warning/20",
};

const textStyles: Record<AlertVariant, string> = {
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning-foreground",
};

const iconStyles: Record<AlertVariant, string> = {
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
};
