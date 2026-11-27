import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "../auth/ProtectedRoute";

const MainLayout = lazy(() => import("../layouts/MainLayout/index.tsx"));
const Login = lazy(() => import("../views/Login"));
const Dashboard = lazy(() => import("../views/Dashboard"));
const Transacoes = lazy(() => import("../views/Transacoes"));
const BensPatrimonio = lazy(() => import("../views/BensPatrimonio"));

const Contas = lazy(() => import("../views/Contas"));

function Loading() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<Box><h1>Página indisponível</h1><Link to="/contas">Voltar para Contas</Link></Box>} />
            <Route path="contas" element={<Contas />} />
            <Route path="transacoes" element={<Transacoes />} />
            <Route path="bens-patrimonio" element={<BensPatrimonio />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
