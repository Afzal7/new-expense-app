"use client";

import React, { createContext, useContext } from "react";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  loading: (message: string) => string | number;
  dismiss: (toastId?: string | number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastFunctions: ToastContextType = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
  };

  return (
    <ToastContext.Provider value={toastFunctions}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}
