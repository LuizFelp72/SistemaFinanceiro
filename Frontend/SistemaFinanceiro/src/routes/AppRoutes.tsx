import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "../auth/ProtectedRoute";

const MainLayout = lazy(() => import("../layouts/MainLayout/index.tsx"));
const Recovery = lazy(() => import("../views/Login/Recovery"));
const Login = lazy(() => import("../views/Login"));
const Dashboard = lazy(() => import("../views/Dashboard"));
const Transacoes = lazy(() => import("../views/Transacoes"));
const BensPatrimonio = lazy(() => import("../views/BensPatrimonio"));

const Contas = lazy(() => import("../views/Contas"));

const Catalogo = lazy(() => import("../views/Catalogo"));
const Relatorios = lazy(() => import("../views/Relatorios"));
const Orcamentos = lazy(() => import("../views/Orcamentos"));
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
        <Route path="/recuperar-senha" element={<Recovery />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<Box><h1>Página indisponível</h1><Link to="/contas">Voltar para Contas</Link></Box>} />
            <Route path="metas" element={<Catalogo resource="goals"/>}/>
            <Route path="categorias" element={<Catalogo resource="categories"/>}/>
            <Route path="metodos-pagamento" element={<Catalogo resource="payment-methods"/>}/>
            <Route path="relatorios" element={<Relatorios/>}/>
            <Route path="orcamentos" element={<Orcamentos/>}/>
            <Route path="configuracoes" element={<Configuracoes/>}/>
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
