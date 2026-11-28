import { useCallback, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";
import { ToastContext, type ToastSeverity } from "./toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; severity: ToastSeverity } | null>(null);
  const notify = useCallback((message: string, severity: ToastSeverity = "success") => {
    setToast({ message, severity });
  }, []);
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}
