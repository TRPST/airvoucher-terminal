"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/utils/cn";

// Create a context and provider for toast functionality
type ToastContextType = {
  toast: (message: string, options?: any) => void;
  success: (message: string, options?: any) => void;
  error: (message: string, options?: any) => void;
  warning: (message: string, options?: any) => void;
  info: (message: string, options?: any) => void;
  dismiss: (id?: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

// Custom hook to use toast functionality
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { theme } = useTheme();
  const [toasts, setToasts] = React.useState<
    Array<{
      id: string;
      message: string;
      type: "default" | "success" | "error" | "warning" | "info";
      duration: number;
    }>
  >([]);

  // Generate a unique ID for each toast
  const generateId = () =>
    `toast-${Math.random().toString(36).substring(2, 9)}`;

  // Toast creation functions
  const toast = (message: string, options?: any) => {
    const id = generateId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: "default",
        duration: options?.duration || 5000,
      },
    ]);
    if (options?.duration !== Infinity) {
      setTimeout(() => dismiss(id), options?.duration || 5000);
    }
    return id;
  };

  const success = (message: string, options?: any) => {
    const id = generateId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: "success",
        duration: options?.duration || 5000,
      },
    ]);
    if (options?.duration !== Infinity) {
      setTimeout(() => dismiss(id), options?.duration || 5000);
    }
    return id;
  };

  const error = (message: string, options?: any) => {
    const id = generateId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: "error",
        duration: options?.duration || 5000,
      },
    ]);
    if (options?.duration !== Infinity) {
      setTimeout(() => dismiss(id), options?.duration || 5000);
    }
    return id;
  };

  const warning = (message: string, options?: any) => {
    const id = generateId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: "warning",
        duration: options?.duration || 5000,
      },
    ]);
    if (options?.duration !== Infinity) {
      setTimeout(() => dismiss(id), options?.duration || 5000);
    }
    return id;
  };

  const info = (message: string, options?: any) => {
    const id = generateId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: "info",
        duration: options?.duration || 5000,
      },
    ]);
    if (options?.duration !== Infinity) {
      setTimeout(() => dismiss(id), options?.duration || 5000);
    }
    return id;
  };

  const dismiss = (id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    } else {
      setToasts([]);
    }
  };

  const contextValue = React.useMemo(
    () => ({
      toast,
      success,
      error,
      warning,
      info,
      dismiss,
    }),
    []
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Sonner Toaster (simpler API) */}
      <SonnerToaster
        position="bottom-right"
        theme={theme as "light" | "dark" | "system"}
        closeButton
        richColors
      />

      {/* Custom Radix Toast (for more control) */}
      <ToastPrimitives.Provider>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastPrimitives.Root
              key={toast.id}
              asChild
              forceMount
              duration={toast.duration}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={cn(
                  "pointer-events-auto fixed bottom-4 right-4 z-50 rounded-md border shadow-lg",
                  "w-[350px] p-4 flex items-start gap-3",
                  toast.type === "default" && "bg-background border-border",
                  toast.type === "success" &&
                    "bg-green-500/10 border-green-500/20 text-green-500",
                  toast.type === "error" &&
                    "bg-destructive/10 border-destructive/20 text-destructive",
                  toast.type === "warning" &&
                    "bg-amber-500/10 border-amber-500/20 text-amber-500",
                  toast.type === "info" &&
                    "bg-primary/10 border-primary/20 text-primary"
                )}
              >
                <div className="flex-1">
                  <p className="text-sm">{toast.message}</p>
                </div>
                <ToastPrimitives.Close asChild>
                  <button
                    onClick={() => dismiss(toast.id)}
                    className="rounded-full p-1 hover:bg-muted"
                  >
                    <X className="h-4 w-4 opacity-70" />
                    <span className="sr-only">Close</span>
                  </button>
                </ToastPrimitives.Close>
              </motion.div>
            </ToastPrimitives.Root>
          ))}
        </AnimatePresence>
        <ToastPrimitives.Viewport />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}
