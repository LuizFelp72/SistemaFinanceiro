import { Box, styled } from "@mui/material";

export const Container = styled(Box)(() => ({
  display: "flex",
  minHeight: "100dvh",
  width: "100%",
}));

export const LeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(6),
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(3) },
}));

export const FormWrapper = styled(Box)(() => ({
  width: "100%",
  maxWidth: 400,
  margin: "0 auto",
}));
