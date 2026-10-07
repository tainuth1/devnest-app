import React, { forwardRef, useId } from "react";
import { cn } from "@/shared/utils/cn";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /**
   * Optional label displayed next to the checkbox.
   */
  label?: React.ReactNode;
  /**
   * Optional error message.
   */
  error?: string;
  /**
   * Class name for the outer wrapper `<div>`.
   */
  wrapperClassName?: string;
  /**
   * Class name for the label element.
   */
  labelClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      name,
      label,
      error,
      checked,
      disabled,
      className,
      wrapperClassName,
      labelClassName,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className={cn("inline-flex flex-col", wrapperClassName)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            "text-body flex cursor-pointer items-center gap-2 text-sm font-medium select-none",
            disabled && "text-muted cursor-not-allowed",
            labelClassName
          )}
        >
          <input
            ref={ref}
            id={checkboxId}
            name={name}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className={cn(
              "text-primary accent-primary focus:ring-primary border-border h-4 w-4 cursor-pointer rounded transition focus:ring-2 focus:outline-none",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
            {...props}
          />
          {label && <span>{label}</span>}
        </label>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
