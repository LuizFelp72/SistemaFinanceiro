import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "../auth/ProtectedRoute";

const MainLayout = lazy(() => import("../layouts/MainLayout/index.tsx"));
const Login = lazy(() => import("../views/Login"));
const Dashboard = lazy(() => import("../views/Dashboard"));
const Transacoes = lazy(() => import("../views/Transacoes"));
const BensPatrimonio = lazy(() => import("../views/BensPatrimonio"));
const Contas = lazy(() => import("../views/Contas"));
const Orcamentos = lazy(() => import("../views/Orcamentos"));
const Relatorios = lazy(() => import("../views/Relatorios"));
const Metas = lazy(() => import("../views/Metas"));
const Categorias = lazy(() => import("../views/Categorias"));
const Configuracoes = lazy(() => import("../views/Configuracoes"));

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
            <Route path="transacoes" element={<Transacoes />} />
            <Route path="bens-patrimonio" element={<BensPatrimonio />} />
            <Route path="contas" element={<Contas />} />
            <Route path="orcamentos" element={<Orcamentos />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="metas" element={<Metas />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
