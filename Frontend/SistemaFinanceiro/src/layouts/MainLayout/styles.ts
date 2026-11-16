import { Box, styled } from "@mui/material";
import { DRAWER_WIDTH, MOBILE_DRAWER_WIDTH } from "./components/Sidebar/styles";

export const Content = styled(Box)(({ theme }) => ({
  marginLeft: DRAWER_WIDTH,
  padding: theme.spacing(3),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    marginLeft: MOBILE_DRAWER_WIDTH,
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));
