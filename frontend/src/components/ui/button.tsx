import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "inline";
type ButtonSize = "default" | "form" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-ring",
  secondary:
    "border-input bg-secondary text-secondary-foreground hover:bg-secondary-hover focus:ring-ring",
  danger:
    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive-hover focus:ring-destructive-ring",
  inline:
    "border-border bg-transparent text-muted-foreground shadow-none hover:border-primary-hover focus:ring-ring",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-4 py-2 text-sm",
  form: "px-4 py-2 text-base sm:text-sm",
  sm: "px-2 py-1 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md border shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
