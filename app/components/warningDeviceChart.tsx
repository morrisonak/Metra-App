import { useState } from "react";
import { TrendingUp, Info } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/chartComponents";

// Sample data - replace with actual data in production
const warningDeviceData = [
  { device: "gates", count: 642, fill: "var(--color-gates)" },
  { device: "flashers", count: 328, fill: "var(--color-flashers)" },
  { device: "passive", count: 214, fill: "var(--color-passive)" },
  { device: "other", count: 64, fill: "var(--color-other)" }
];

const chartConfig = {
  count: {
    label: "Crossings",
  },
  gates: {
    label: "Gates",
    color: "hsl(var(--chart-1))"
  },
  flashers: {
    label: "Flashers",
    color: "hsl(var(--chart-2))"
  },
  passive: {
    label: "Passive",
    color: "hsl(var(--chart-3))"
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-4))"
  }
} satisfies ChartConfig;

interface WarningDeviceChartProps {
  detailed?: boolean;
  className?: string;
}

export function WarningDeviceChart({ detailed = false, className }: WarningDeviceChartProps) {
  // This would come from actual data analysis in a real implementation
  const [complianceRate, setComplianceRate] = useState({
    overall: 94.8,
    change: 1.2
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Warning Devices</CardTitle>
        <CardDescription>Distribution of warning device types</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] [&_.recharts-pie-label-text]:fill-foreground dark:[&_.recharts-pie-label-text]:fill-white"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={warningDeviceData}
                dataKey="count"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => chartConfig[entry.device]?.label || entry.device}
                labelLine={true}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {complianceRate.change > 0 ? (
            <>
              Compliance rate: {complianceRate.overall}% <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Compliance rate: {complianceRate.overall}% <Info className="h-4 w-4 text-blue-500" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Gates and flashers represent {((warningDeviceData[0].count + warningDeviceData[1].count) / warningDeviceData.reduce((sum, item) => sum + item.count, 0) * 100).toFixed(1)}% of all crossings
        </div>
      </CardFooter>
    </Card>
  );
}