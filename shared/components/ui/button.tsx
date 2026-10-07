import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type ButtonVariant =
  "primary" | "outline" | "secondary" | "ghost" | "danger" | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant. Defaults to "primary".
   */
  variant?: ButtonVariant;
  /**
   * Size of the button. Defaults to "md" which matches the design in the projects page.
   */
  size?: ButtonSize;
  /**
   * Whether the button is in a loading state. Displays an animated spinner and disables the button.
   */
  isLoading?: boolean;
  /**
   * Optional text to show while in the loading state.
   */
  loadingText?: string;
  /**
   * Icon or element displayed to the left of the button content.
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon or element displayed to the right of the button content.
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the button should stretch to fill the width of its parent container.
   * @default false
   */
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 disabled:bg-primary/50 shadow-2xs",
  outline:
    "border border-border bg-white text-heading hover:bg-zinc-50 hover:border-border-hover active:bg-zinc-100 disabled:bg-zinc-50 disabled:border-border/60 disabled:text-muted shadow-2xs",
  secondary:
    "bg-zinc-100 text-heading hover:bg-zinc-200/80 active:bg-zinc-200 disabled:bg-zinc-100 disabled:text-muted shadow-2xs",
  ghost:
    "text-body hover:bg-zinc-100 hover:text-heading active:bg-zinc-200/70 disabled:hover:bg-transparent disabled:text-muted shadow-none",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-600/50 shadow-2xs",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-600/50 shadow-2xs",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs rounded-md gap-1",
  md: "h-8.5 px-3.5 text-xs rounded-md gap-1.5",
  lg: "h-10 px-4 text-sm rounded-lg gap-2",
};

const loaderSizes: Record<ButtonSize, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const iconSizes: Record<ButtonSize, string> = {
  sm: "[&>svg]:h-3 [&>svg]:w-3",
  md: "[&>svg]:h-3.5 [&>svg]:w-3.5",
  lg: "[&>svg]:h-4 [&>svg]:w-4",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center font-medium transition-colors focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className={cn("animate-spin", loaderSizes[size])} />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center",
                  iconSizes[size]
                )}
              >
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center",
                  iconSizes[size]
                )}
              >
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
