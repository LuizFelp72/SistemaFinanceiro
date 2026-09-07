import { Box, styled } from "@mui/material";

export const Container = styled(Box)(() => ({
  display: "flex",
  height: "100vh",
  width: "100%",
}));

export const LeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(6),
}));

export const FormWrapper = styled(Box)(() => ({
  width: "100%",
  maxWidth: 400,
  margin: "0 auto",
}));
