import { Box, Drawer, ListItemButton, styled } from "@mui/material";
import { cores } from "../../../../theme/theme";

export const DRAWER_WIDTH = 185;
export const MOBILE_DRAWER_WIDTH = 68;

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    backgroundColor: cores.menu,
    color: cores.menuTexto,
    borderRight: "none",
    overflowX: "hidden",
  },
  [theme.breakpoints.down("md")]: {
    width: MOBILE_DRAWER_WIDTH,
    "& .MuiDrawer-paper": { width: MOBILE_DRAWER_WIDTH },
  },
}));

export const LogoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "26px 20px 24px",
  [theme.breakpoints.down("md")]: {
    justifyContent: "center",
    padding: "20px 8px",
    "& .logo-nome": { display: "none" },
  },
}));

export const LogoMarca = styled(Box)({
  width: 35,
  height: 35,
  borderRadius: 9,
  display: "grid",
  placeItems: "center",
  backgroundColor: cores.primaria,
  color: cores.branco,
  fontSize: 17,
  fontWeight: 700,
});

export const NavList = styled("nav")({
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "0 9px",
});

export const NavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  flexGrow: 0,
  gap: 11,
  minHeight: 41,
  padding: "6px 15px",
  borderRadius: 12,
  border: `2px solid ${active ? cores.branco : "transparent"}`,
  color: active ? cores.branco : cores.menuTexto,
  backgroundColor: active ? cores.primaria : "transparent",
  "&:hover": { backgroundColor: active ? cores.primaria : "rgba(255,255,255,.05)" },
  "&.Mui-focusVisible": { backgroundColor: active ? cores.primaria : "rgba(255,255,255,.12)" },
  "& .MuiSvgIcon-root": { fontSize: 19 },
  "& .nav-nome": { fontSize: 15, fontWeight: active ? 600 : 500, lineHeight: 1.35 },
  [theme.breakpoints.down("md")]: {
    justifyContent: "center",
    padding: 10,
    "& .nav-nome": { display: "none" },
  },
}));
