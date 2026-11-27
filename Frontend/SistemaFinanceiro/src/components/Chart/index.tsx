import ReactEChartsCore from "echarts-for-react/esm/core";
import * as echarts from "echarts/core";
import { LineChart, PieChart } from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import { Box, Typography, useMediaQuery } from "@mui/material";

echarts.use([
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  AriaComponent,
  SVGRenderer,
]);

interface ChartProps {
  option: EChartsOption;
  label: string;
  height?: number;
  empty?: boolean;
}

export default function Chart({ option, label, height = 230, empty }: ChartProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  if (empty) {
    return (
      <Box
        sx={{ height, display: "grid", placeItems: "center", textAlign: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          Nenhum dado para o período selecionado.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <ReactEChartsCore
        echarts={echarts}
        option={{
          ...option,
          ...(reducedMotion && { animation: false }),
          textStyle: { fontFamily: "Roboto, Arial, sans-serif" },
          aria: { enabled: true, label: { description: label } },
        }}
        notMerge
        opts={{ renderer: "svg" }}
        style={{ height, width: "100%" }}
      />
    </Box>
  );
}
