import { Box, Drawer, ListItemButton, styled } from "@mui/material";

export const DRAWER_WIDTH = 260;
export const MOBILE_DRAWER_WIDTH = 72;

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    backgroundColor: "#0f172a",
    color: "#cbd5e1",
    borderRight: "none",
    borderRadius: 0,
  },
  [theme.breakpoints.down("md")]: {
    width: MOBILE_DRAWER_WIDTH,
    "& .MuiDrawer-paper": { width: MOBILE_DRAWER_WIDTH },
  },
}));

export const LogoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(3, 3, 2),
  [theme.breakpoints.down("md")]: {
    justifyContent: "center",
    padding: theme.spacing(3, 1, 2),
    "& .MuiTypography-root": { display: "none" },
  },
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
  [theme.breakpoints.down("md")]: {
    margin: theme.spacing(0.75, 1),
    padding: theme.spacing(1.5),
    justifyContent: "center",
    "& .MuiListItemIcon-root": { minWidth: 0 },
    "& .MuiListItemText-root": { display: "none" },
  },
}));

export const NavList = styled(Box)(() => ({
  flex: 1,
  overflowY: "auto",
}));
