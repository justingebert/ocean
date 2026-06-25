import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "inline";
type ButtonSize = "default" | "form" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
  danger: "border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  inline:
    "border-gray-200 text-gray-400 bg-transparent shadow-none hover:border-indigo-700 focus:ring-indigo-500",
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
