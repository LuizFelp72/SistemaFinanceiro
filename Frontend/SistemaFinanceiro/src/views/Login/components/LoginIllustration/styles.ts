import { Box, styled } from "@mui/material";

export const RightPanel = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  flex: 1,
  background: `linear-gradient(160deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(6),
  textAlign: "center",
}));

export const ImageWrapper = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  "&::before": {
    content: '""',
    position: "absolute",
    width: "60%",
    height: "60%",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.25)",
    filter: "blur(60px)",
    zIndex: 0,
  },
}));

export const IllustrationImage = styled("img")(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  maxWidth: "70%",
  height: "auto",
  marginBottom: theme.spacing(1),
}));

export const Eyebrow = styled(Box)(() => ({
  fontSize: "0.8rem",
  opacity: 0.75,
  letterSpacing: 0.4,
}));
