"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps) {
  const variantStyles = {
    default: "bg-background border-border",
    success:
      "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400",
    error: "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400",
    warning:
      "bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto backdrop-blur-lg w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        "animate-in slide-in-from-top-full duration-300",
        variantStyles[variant],
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {title && <p className="text-sm font-semibold">{title}</p>}
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast container component
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed top-0 right-0 z-[9999] flex max-h-screen w-full flex-col gap-2 p-4 sm:top-4 sm:right-4 sm:max-w-md">
      {children}
    </div>
  );
}

// Simple toast hook
export function useToast() {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    [],
  );

  const showToast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = props.duration || 3000;

    setToasts((prev) => [...prev, { ...props, id }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}
