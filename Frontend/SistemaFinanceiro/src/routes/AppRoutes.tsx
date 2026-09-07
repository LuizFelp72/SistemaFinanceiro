import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "../auth/ProtectedRoute";

const MainLayout = lazy(() => import("../layouts/MainLayout/index.tsx"));
const Login = lazy(() => import("../views/Login"));

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
          <Route path="/" element={<MainLayout />}></Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
