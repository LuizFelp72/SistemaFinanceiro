import { Box, styled } from "@mui/material";
import { DRAWER_WIDTH } from "./components/Sidebar/styles";

export const Content = styled(Box)(({ theme }) => ({
  marginLeft: DRAWER_WIDTH,
  padding: theme.spacing(3),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
}));
