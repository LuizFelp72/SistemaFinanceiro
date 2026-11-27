import { styled } from "@mui/material";
import { cores } from "../../theme/theme";
import { DRAWER_WIDTH, MOBILE_DRAWER_WIDTH } from "./components/Sidebar/styles";

export const Content = styled("main")(({ theme }) => ({
  marginLeft: DRAWER_WIDTH,
  minHeight: "100vh",
  minWidth: 0,
  backgroundColor: cores.fundo,
  [theme.breakpoints.down("md")]: { marginLeft: MOBILE_DRAWER_WIDTH },
  "@media print": { marginLeft: 0 },
}));
