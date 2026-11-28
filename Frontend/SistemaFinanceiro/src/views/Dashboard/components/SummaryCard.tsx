import { dinheiro } from "../../Contas/accounts";
import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { formatarMoeda } from "../../../utils/financeiro";
import { DashboardCard } from "../styles";

interface SummaryCardProps {
  title: string;
  value: number | bigint;
  currency?: string;
  description: string;
  icon: SvgIconComponent;
  color: string;
  background: string;
}

export default function SummaryCard({
  title,
  value,
  currency = "BRL",
  description,
  icon: Icon,
  color,
  background,
}: SummaryCardProps) {
  return (
    <DashboardCard sx={{ display: "flex", alignItems: "flex-start", gap: 1.75 }}>
      <Box sx={{ p: 1, borderRadius: 2, bgcolor: background, color, display: "flex", mt: 0.25 }}>
        <Icon sx={{ fontSize: 21 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h2" sx={{ fontSize: 12, fontWeight: 500, color: "text.secondary", mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 23, lg: 21, xl: 24 }, letterSpacing: "-.5px", fontVariantNumeric: "tabular-nums" }}>
          {typeof value === "bigint" ? dinheiro(value, currency) : formatarMoeda(value, currency)}
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 1 }}>
          {description}
        </Typography>
      </Box>
    </DashboardCard>
  );
}
