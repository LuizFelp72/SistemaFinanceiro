import { Box, styled } from "@mui/material";

export const CardContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  [theme.breakpoints.down("md")]: {
    justifyContent: "center",
    padding: theme.spacing(1),
    "& > .MuiBox-root, & > .MuiSvgIcon-root": { display: "none" },
  },
}));
