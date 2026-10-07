import React, { useRef, useEffect } from "react";
import { cn } from "@/shared/utils/cn";

export interface OtpInputProps {
  /**
   * Number of digits in the OTP.
   * @default 6
   */
  length?: number;
  /**
   * Array of string digits representing current OTP state.
   */
  value: string[];
  /**
   * Callback invoked when OTP changes.
   */
  onChange: (value: string[]) => void;
  /**
   * Optional error message.
   */
  error?: string;
  /**
   * Whether the inputs are disabled.
   */
  disabled?: boolean;
  /**
   * Auto-focus the first input on initial mount.
   * @default true
   */
  autoFocus?: boolean;
  /**
   * Optional container class name.
   */
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
  className,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const rawVal = e.target.value;
    // Only accept numeric characters
    const numericChar = rawVal.replace(/\D/g, "");

    const newOtp = [...value];
    newOtp[index] = numericChar.slice(-1); // Take the latest typed digit
    onChange(newOtp);

    // Auto-focus next input if a digit was entered
    if (numericChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Current input is empty, focus previous and clear it
        const newOtp = [...value];
        newOtp[index - 1] = "";
        onChange(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...value];
        newOtp[index] = "";
        onChange(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pastedData) return;

    const newOtp = [...value];
    for (let i = 0; i < length; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    onChange(newOtp);

    // Focus the next empty input or the last input
    const targetIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[targetIndex]?.focus();
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={value[index] || ""}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={cn(
              "border-border text-heading hover:border-border-hover h-12 w-12 rounded-lg border bg-white text-center text-xl font-bold transition sm:h-14 sm:w-14 sm:text-2xl",
              "focus:ring-2 focus:outline-none",
              error
                ? "border-red-500 focus:border-red-600 focus:ring-red-100"
                : "focus:border-primary focus:ring-primary/20",
              disabled &&
                "border-border text-muted cursor-not-allowed bg-zinc-50"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default OtpInput;
