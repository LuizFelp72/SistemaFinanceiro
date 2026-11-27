import { Navigate, Outlet } from "react-router-dom";
import { Alert, Button, LinearProgress } from "@mui/material";
import { useAuth } from "./session";
export default function ProtectedRoute() {
  const { user, loading, sessionError } = useAuth();
  if (loading) return <LinearProgress aria-label="Verificando sessão" />;
  if (sessionError) return <Alert severity="error" action={<Button onClick={() => location.reload()}>Tentar novamente</Button>}>Não foi possível verificar sua sessão.</Alert>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
