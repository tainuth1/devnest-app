"use client";

import { useSyncExternalStore } from "react";
import type {
  ToastData,
  ToastOptions,
  ToastType,
  PromiseToastMessages,
} from "./toast-types";

let toasts: ToastData[] = [];
const SERVER_SNAPSHOT: ToastData[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

class ToastStore {
  getSnapshot = (): ToastData[] => {
    return toasts;
  };

  getServerSnapshot = (): ToastData[] => {
    return SERVER_SNAPSHOT;
  };

  subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  add = (
    type: ToastType,
    title: React.ReactNode,
    options?: ToastOptions
  ): string => {
    const id = options?.id || generateId();

    const existingIndex = toasts.findIndex((t) => t.id === id);
    const newToast: ToastData = {
      ...options,
      id,
      type,
      title,
      createdAt: Date.now(),
      isDismissing: false,
    };

    if (existingIndex > -1) {
      toasts = [
        ...toasts.slice(0, existingIndex),
        newToast,
        ...toasts.slice(existingIndex + 1),
      ];
    } else {
      toasts = [newToast, ...toasts];
    }

    notify();
    return id;
  };

  update = (id: string, updates: Partial<ToastData>): void => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, ...updates } : t));
    notify();
  };

  dismiss = (id?: string): void => {
    if (!id) {
      // Dismiss all
      toasts = toasts.map((t) => ({ ...t, isDismissing: true }));
    } else {
      toasts = toasts.map((t) =>
        t.id === id ? { ...t, isDismissing: true } : t
      );
    }
    notify();
  };

  remove = (id: string): void => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  };

  clear = (): void => {
    toasts = [];
    notify();
  };
}

export const toastStore = new ToastStore();

export function useToasts(): ToastData[] {
  return useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot
  );
}

// Main toast API object with functional calls
export interface ToastFn {
  (title: React.ReactNode, options?: ToastOptions): string;
  success: (title: React.ReactNode, options?: ToastOptions) => string;
  error: (title: React.ReactNode, options?: ToastOptions) => string;
  warning: (title: React.ReactNode, options?: ToastOptions) => string;
  info: (title: React.ReactNode, options?: ToastOptions) => string;
  loading: (title: React.ReactNode, options?: ToastOptions) => string;
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: PromiseToastMessages<T>,
    options?: ToastOptions
  ) => Promise<T>;
  dismiss: (id?: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const baseToast = ((title: React.ReactNode, options?: ToastOptions) => {
  return toastStore.add("default", title, options);
}) as ToastFn;

baseToast.success = (title: React.ReactNode, options?: ToastOptions) => {
  return toastStore.add("success", title, options);
};

baseToast.error = (title: React.ReactNode, options?: ToastOptions) => {
  return toastStore.add("error", title, options);
};

baseToast.warning = (title: React.ReactNode, options?: ToastOptions) => {
  return toastStore.add("warning", title, options);
};

baseToast.info = (title: React.ReactNode, options?: ToastOptions) => {
  return toastStore.add("info", title, options);
};

baseToast.loading = (title: React.ReactNode, options?: ToastOptions) => {
  return toastStore.add("loading", title, {
    duration: Infinity,
    ...options,
  });
};

baseToast.promise = <T>(
  promise: Promise<T> | (() => Promise<T>),
  messages: PromiseToastMessages<T>,
  options?: ToastOptions
): Promise<T> => {
  const id = baseToast.loading(messages.loading, options);
  const p = typeof promise === "function" ? promise() : promise;

  p.then((data) => {
    const successTitle =
      typeof messages.success === "function"
        ? messages.success(data)
        : messages.success;

    const successDesc =
      typeof messages.description === "function"
        ? messages.description(data)
        : (messages.description ?? options?.description);

    toastStore.update(id, {
      type: "success",
      title: successTitle,
      description: successDesc,
      duration: options?.duration ?? 4000,
    });
    return data;
  }).catch((err) => {
    const errorTitle =
      typeof messages.error === "function"
        ? messages.error(err)
        : messages.error;

    toastStore.update(id, {
      type: "error",
      title: errorTitle,
      duration: options?.duration ?? 5000,
    });
  });

  return p;
};

baseToast.dismiss = (id?: string) => {
  toastStore.dismiss(id);
};

baseToast.remove = (id: string) => {
  toastStore.remove(id);
};

baseToast.clear = () => {
  toastStore.clear();
};

export const toast = baseToast;
