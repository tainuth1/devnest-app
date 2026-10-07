"use client";

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption<T = string> {
  value: T;
  label: React.ReactNode;
  triggerLabel?: React.ReactNode;
  description?: string;
  dotColor?: string;
  icon?: React.ReactNode;
  dividerAbove?: boolean;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | T)[];
  placeholder?: string;
  size?: SelectSize;
  leftIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  isCleared?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  align?: "left" | "right";
  portal?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  renderTrigger?: (
    selectedOption?: SelectOption<T>,
    value?: T
  ) => React.ReactNode;
  renderOption?: (
    option: SelectOption<T>,
    isSelected: boolean
  ) => React.ReactNode;
  ariaLabel?: string;
}

export interface SelectRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const triggerSizeClasses: Record<SelectSize, string> = {
  sm: "h-7.5 px-2.5 text-xs rounded-md gap-1.5",
  md: "h-8.5 px-3 text-xs rounded-md gap-1.5",
  lg: "h-10 px-3.5 text-sm rounded-lg gap-2",
};

const menuSizeClasses: Record<SelectSize, string> = {
  sm: "p-1 text-xs rounded-xl",
  md: "p-1 text-xs rounded-xl",
  lg: "p-1.5 text-sm rounded-xl",
};

const itemSizeClasses: Record<SelectSize, string> = {
  sm: "px-2 py-1.5 text-xs rounded-md",
  md: "px-2.5 py-1.5 text-xs rounded-lg",
  lg: "px-3 py-2 text-sm rounded-lg",
};

const iconSizeClasses: Record<SelectSize, string> = {
  sm: "h-3 w-3",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

const checkSizeClasses: Record<SelectSize, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

function SelectComponent<T = string>(
  {
    value,
    onChange,
    options,
    placeholder = "Select...",
    size = "md",
    leftIcon,
    clearable = false,
    onClear,
    isCleared = false,
    isLoading = false,
    disabled = false,
    align = "left",
    portal = true,
    className,
    triggerClassName,
    menuClassName,
    renderTrigger,
    renderOption,
    ariaLabel,
  }: SelectProps<T>,
  ref: React.Ref<SelectRef>
) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    minWidth?: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // If trigger scrolled completely out of viewport, close dropdown
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false);
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuHeight = menuRef.current?.offsetHeight || 180;
    const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    const menuWidth = menuRef.current?.offsetWidth || rect.width;
    let left: number | undefined = undefined;
    let right: number | undefined = undefined;

    if (align === "right") {
      right = Math.max(8, window.innerWidth - rect.right);
    } else {
      left = rect.left;
      if (left + menuWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - menuWidth - 8);
      }
      if (left < 8) left = 8;
    }

    setMenuCoords({
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
      left,
      right,
      minWidth: rect.width,
    });
  }, [align]);

  const openDropdown = useCallback(() => {
    if (disabled || isLoading) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;

      let left: number | undefined = undefined;
      let right: number | undefined = undefined;

      if (align === "right") {
        right = Math.max(8, window.innerWidth - rect.right);
      } else {
        left = Math.max(8, rect.left);
      }

      setMenuCoords({
        top: openUpward ? undefined : rect.bottom + 4,
        bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
        left,
        right,
        minWidth: rect.width,
      });
    }
    setIsOpen(true);
  }, [disabled, isLoading, align]);

  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, closeDropdown, openDropdown]);

  useImperativeHandle(ref, () => ({
    open: openDropdown,
    close: closeDropdown,
    toggle: toggleDropdown,
  }));

  // Normalize options
  const normalizedOptions: SelectOption<T>[] = options.map((opt) => {
    if (typeof opt === "object" && opt !== null && "value" in opt) {
      return opt as SelectOption<T>;
    }
    return {
      value: opt as T,
      label: String(opt),
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Outside click & Escape key listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeDropdown]);

  // Keep dropdown menu attached to trigger on window scroll or resize
  useEffect(() => {
    if (!isOpen || !portal) return;

    const handleScrollOrResize = () => {
      updateMenuPosition();
    };

    const frameId = requestAnimationFrame(updateMenuPosition);

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, portal, updateMenuPosition]);

  const handleSelectOption = (opt: SelectOption<T>) => {
    if (opt.disabled || disabled || isLoading) return;
    onChange(opt.value);
    closeDropdown();
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  const renderMenuContent = () => {
    if (!isOpen) return null;

    const menuNode = (
      <div
        ref={menuRef}
        role="listbox"
        style={
          portal && menuCoords
            ? {
                position: "fixed",
                top:
                  menuCoords.top !== undefined
                    ? `${menuCoords.top}px`
                    : undefined,
                bottom:
                  menuCoords.bottom !== undefined
                    ? `${menuCoords.bottom}px`
                    : undefined,
                left:
                  menuCoords.left !== undefined
                    ? `${menuCoords.left}px`
                    : undefined,
                right:
                  menuCoords.right !== undefined
                    ? `${menuCoords.right}px`
                    : undefined,
                minWidth:
                  menuCoords.minWidth !== undefined
                    ? `${menuCoords.minWidth}px`
                    : undefined,
                zIndex: 60,
              }
            : undefined
        }
        className={cn(
          "border-border text-body max-h-72 w-max overflow-y-auto border bg-white shadow-lg",
          portal
            ? "fixed z-60"
            : cn(
                "absolute z-30 mt-1 min-w-full",
                align === "right" ? "right-0" : "left-0"
              ),
          menuSizeClasses[size],
          menuClassName
        )}
      >
        {normalizedOptions.map((option, idx) => {
          const isSelected = option.value === value;

          return (
            <React.Fragment key={String(option.value) + idx}>
              {option.dividerAbove && (
                <div className="border-border-subtle my-1 border-t" />
              )}

              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => handleSelectOption(option)}
                className={cn(
                  "hover:text-heading flex w-full cursor-pointer items-center justify-between transition-colors hover:bg-zinc-100",
                  itemSizeClasses[size],
                  isSelected ? "text-heading font-medium" : "",
                  option.disabled ? "cursor-not-allowed opacity-50" : ""
                )}
              >
                {renderOption ? (
                  renderOption(option, isSelected)
                ) : (
                  <>
                    <div className="flex items-center gap-2 pr-2">
                      {option.icon && <span>{option.icon}</span>}
                      {option.dotColor && (
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            option.dotColor
                          )}
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check
                        className={cn(
                          "text-primary shrink-0",
                          checkSizeClasses[size]
                        )}
                      />
                    )}
                  </>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );

    if (portal && typeof document !== "undefined" && document.body) {
      return createPortal(menuNode, document.body);
    }

    return menuNode;
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left", className)}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || isLoading}
        onClick={toggleDropdown}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "border-border text-body hover:border-border-hover flex cursor-pointer items-center border bg-white font-normal shadow-2xs transition-colors hover:bg-zinc-50 focus:outline-hidden",
          triggerSizeClasses[size],
          disabled || isLoading
            ? "hover:border-border cursor-not-allowed opacity-60 hover:bg-white"
            : "",
          triggerClassName
        )}
      >
        {/* Left Element / Icon / Custom Trigger Content */}
        {renderTrigger ? (
          renderTrigger(selectedOption, value)
        ) : (
          <>
            {leftIcon && (
              <span className="text-muted shrink-0">{leftIcon}</span>
            )}
            {selectedOption?.icon && (
              <span className="shrink-0">{selectedOption.icon}</span>
            )}
            {selectedOption?.dotColor && (
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  selectedOption.dotColor
                )}
              />
            )}
            <span className="truncate">
              {selectedOption?.triggerLabel ??
                selectedOption?.label ??
                placeholder}
            </span>
          </>
        )}

        {/* Right Icon / Clear / Spinner / Chevron */}
        {isLoading ? (
          <Loader2
            className={cn(
              "text-muted shrink-0 animate-spin",
              iconSizeClasses[size]
            )}
          />
        ) : clearable && !isCleared ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClearClick}
            className="text-muted hover:text-heading shrink-0 cursor-pointer rounded p-0.5 hover:bg-zinc-100"
            title="Clear selection"
          >
            <X className={iconSizeClasses[size]} />
          </span>
        ) : (
          <ChevronDown
            className={cn(
              "text-muted shrink-0 transition-transform duration-200",
              iconSizeClasses[size],
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {renderMenuContent()}
    </div>
  );
}

const ForwardedSelect = forwardRef(SelectComponent);
ForwardedSelect.displayName = "Select";

export const Select = ForwardedSelect as <T = string>(
  props: SelectProps<T> & React.RefAttributes<SelectRef>
) => React.ReactElement;

export default Select;
