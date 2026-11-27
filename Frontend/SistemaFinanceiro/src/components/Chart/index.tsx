import ReactEChartsCore from "echarts-for-react/esm/core";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { AriaComponent, GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import { Box, Typography } from "@mui/material";
import { FONTE } from "../../theme/theme";

echarts.use([
  BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, AriaComponent, SVGRenderer,
]);

interface ChartProps {
  option: EChartsOption;
  label: string;
  height?: number;
  width?: number | string;
  empty?: boolean;
}

export default function Chart({ option, label, height = 230, width = "100%", empty }: ChartProps) {
  if (empty) {
    return (
      <Box sx={{ height, width, display: "grid", placeItems: "center", textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">Sem dados no período.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 0, width }}>
      <ReactEChartsCore
        echarts={echarts}
        option={{ ...option, textStyle: { fontFamily: FONTE }, aria: { enabled: true, label: { description: label } } }}
        notMerge
        opts={{ renderer: "svg" }}
        style={{ height, width: "100%" }}
      />
    </Box>
  );
}
