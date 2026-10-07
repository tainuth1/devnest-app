import React, { forwardRef, useId } from "react";
import { cn } from "@/shared/utils/cn";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /**
   * Size of the input. Defaults to "md" which matches the design in the projects page.
   */
  size?: InputSize;
  /**
   * Optional label displayed above the input.
   */
  label?: React.ReactNode;
  /**
   * Optional node positioned to the right of the label (e.g. "Forgot password?" link).
   */
  labelRight?: React.ReactNode;
  /**
   * Error message string. When provided, highlights input border in red.
   */
  error?: string;
  /**
   * Subordinate helper text displayed below the input when there is no error.
   */
  helperText?: React.ReactNode;
  /**
   * Icon or element displayed inside the input on the left side.
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon or element displayed inside the input on the right side.
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the input container should take full width of its parent.
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Class name for the outer wrapper `<div>`.
   */
  wrapperClassName?: string;
  /**
   * Class name for the label element.
   */
  labelClassName?: string;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-7 text-xs rounded-md",
  md: "h-8.5 text-xs rounded-md",
  lg: "h-10 text-sm rounded-lg",
};

const horizontalPadding: Record<
  InputSize,
  { default: string; leftIcon: string; rightIcon: string; bothIcons: string }
> = {
  sm: {
    default: "px-2.5",
    leftIcon: "pl-7.5 pr-2.5",
    rightIcon: "pl-2.5 pr-7.5",
    bothIcons: "pl-7.5 pr-7.5",
  },
  md: {
    default: "px-3",
    leftIcon: "pl-8.5 pr-3",
    rightIcon: "pl-3 pr-8",
    bothIcons: "pl-8.5 pr-8",
  },
  lg: {
    default: "px-3.5",
    leftIcon: "pl-10 pr-3.5",
    rightIcon: "pl-3.5 pr-10",
    bothIcons: "pl-10 pr-10",
  },
};

const leftIconWrapperClasses: Record<InputSize, string> = {
  sm: "pl-2.5 [&_svg]:h-3 [&_svg]:w-3",
  md: "pl-3 [&_svg]:h-3.5 [&_svg]:w-3.5",
  lg: "pl-3.5 [&_svg]:h-4 [&_svg]:w-4",
};

const rightIconWrapperClasses: Record<InputSize, string> = {
  sm: "pr-2.5 [&_svg]:h-3 [&_svg]:w-3",
  md: "pr-2.5 [&_svg]:h-3.5 [&_svg]:w-3.5",
  lg: "pr-3 [&_svg]:h-4 [&_svg]:w-4",
};

const labelSizes: Record<InputSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      type = "text",
      size = "md",
      label,
      labelRight,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      className,
      wrapperClassName,
      labelClassName,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon);

    let paddingClass = horizontalPadding[size].default;
    if (hasLeftIcon && hasRightIcon) {
      paddingClass = horizontalPadding[size].bothIcons;
    } else if (hasLeftIcon) {
      paddingClass = horizontalPadding[size].leftIcon;
    } else if (hasRightIcon) {
      paddingClass = horizontalPadding[size].rightIcon;
    }

    return (
      <div className={cn(fullWidth ? "w-full" : "", wrapperClassName)}>
        {/* Label & Label Right Header */}
        {(label || labelRight) && (
          <div className="mb-1.5 flex items-center justify-between">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-body block font-medium",
                  labelSizes[size],
                  disabled && "text-muted",
                  labelClassName
                )}
              >
                {label}
              </label>
            )}
            {labelRight && (
              <div className={cn("text-muted font-medium", labelSizes[size])}>
                {labelRight}
              </div>
            )}
          </div>
        )}

        {/* Input Wrapper with Icons */}
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                "text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center",
                leftIconWrapperClasses[size]
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            disabled={disabled}
            className={cn(
              "border-border text-heading placeholder:text-muted hover:border-border-hover w-full border bg-white shadow-2xs transition-colors focus:outline-none",
              sizeClasses[size],
              paddingClass,
              error
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "focus:border-primary focus:ring-primary focus:ring-1",
              disabled &&
                "border-border text-muted placeholder:text-muted/60 cursor-not-allowed bg-zinc-50 shadow-none",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                "text-muted absolute inset-y-0 right-0 flex items-center",
                rightIconWrapperClasses[size]
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message or Helper text */}
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-description mt-1 text-xs">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
