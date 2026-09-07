import { Box, Drawer, ListItemButton, styled } from "@mui/material";

export const DRAWER_WIDTH = 260;

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    backgroundColor: "#0f172a",
    color: "#cbd5e1",
    borderRight: "none",
  },
}));

export const LogoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(3, 3, 2),
}));

export const NavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  margin: theme.spacing(0.5, 2),
  borderRadius: theme.shape.borderRadius,
  color: active ? "#fff" : "#94a3b8",
  backgroundColor: active ? theme.palette.primary.main : "transparent",
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : "rgba(255,255,255,0.05)",
  },
  "& .MuiListItemIcon-root": {
    color: active ? "#fff" : "#94a3b8",
    minWidth: 36,
  },
}));

export const NavList = styled(Box)(() => ({
  flex: 1,
  overflowY: "auto",
}));
