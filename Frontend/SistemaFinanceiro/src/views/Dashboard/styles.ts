import { Box, Paper, styled } from "@mui/material";

export const DashboardContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
  minWidth: 0,
  maxWidth: 1800,
  margin: "0 auto",
}));

export const SummaryGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "minmax(0, 1fr)",
  },
}));

export const ChartGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1.1fr) minmax(210px, .85fr)",
  gap: theme.spacing(2),
  [theme.breakpoints.down("xl")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    "& > :last-child": { gridColumn: "1 / -1" },
  },
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "minmax(0, 1fr)",
  },
}));

export const DetailGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
  gap: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "minmax(0, 1fr)",
  },
}));

export const DashboardCard = styled(Paper)(({ theme }) => ({
  minWidth: 0,
  padding: theme.spacing(2.5),
  border: "1px solid #EAECF0",
  borderRadius: 12,
  boxShadow: "0 2px 6px rgba(16, 24, 40, .015)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

export const CardHeading = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  "& h2": { fontSize: 14, fontWeight: 600, margin: 0 },
}));

export const LegendRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  fontSize: 12,
  color: theme.palette.text.secondary,
  "& .legend-dot": {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: "50%",
  },
}));
