import { createContext, useContext } from "react";

export type ToastSeverity = "success" | "error" | "info";
export const ToastContext = createContext<(message: string, severity?: ToastSeverity) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}
