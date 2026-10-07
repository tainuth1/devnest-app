import type { ReactNode } from "react";

export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "default";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  altText?: string;
}

export interface ToastOptions {
  /** Optional custom ID to avoid duplicates or update an existing toast */
  id?: string;
  /** Subtitle or secondary detail */
  description?: ReactNode;
  /** Duration in milliseconds. Defaults to 4000. Use 0 or Infinity for persistent */
  duration?: number;
  /** Call-to-action button */
  action?: ToastAction;
  /** Cancel button */
  cancel?: ToastAction;
  /** Custom icon overriding default type icon */
  icon?: ReactNode;
  /** Custom CSS classes for the toast card */
  className?: string;
  /** Show close button (defaults to true) */
  closable?: boolean;
  /** Callback triggered when toast is dismissed */
  onDismiss?: (id: string) => void;
  /** Callback triggered when auto-close timer fires */
  onAutoClose?: (id: string) => void;
}

export interface ToastData extends ToastOptions {
  id: string;
  type: ToastType;
  title: ReactNode;
  createdAt: number;
  isDismissing?: boolean;
}

export interface PromiseToastMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((data: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
  description?: ReactNode | ((data: T) => ReactNode);
}

export interface ToasterProps {
  /** Viewport screen position */
  position?: ToastPosition;
  /** Default duration in milliseconds (default: 4000) */
  duration?: number;
  /** Maximum number of visible toasts stacked (default: 5) */
  maxVisible?: boolean | number;
  /** Whether to show a subtle progress bar (default: true) */
  showProgress?: boolean;
  /** Custom container className */
  className?: string;
}
