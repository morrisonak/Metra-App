import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/chartComponents";

// Sample data - replace with actual data in production
const crossingTypeData = [
  { type: "public", count: 876, fill: "var(--color-public)" },
  { type: "private", count: 287, fill: "var(--color-private)" },
  { type: "pedestrian", count: 85, fill: "var(--color-pedestrian)" }
];

const chartConfig = {
  count: {
    label: "Crossings",
  },
  public: {
    label: "Public",
    color: "hsl(var(--chart-1))"
  },
  private: {
    label: "Private",
    color: "hsl(var(--chart-2))"
  },
  pedestrian: {
    label: "Pedestrian",
    color: "hsl(var(--chart-3))"
  }
} satisfies ChartConfig;

interface CrossingTypeChartProps {
  detailed?: boolean;
  className?: string;
}

// Type-safe approach for data entries
type CrossingTypeDataEntry = typeof crossingTypeData[number];

export function CrossingTypeChart({ detailed = false, className }: CrossingTypeChartProps) {
  // This would come from actual data analysis in a real implementation
  const [trend, setTrend] = useState({
    direction: "up",
    percentage: 3.7,
    period: "quarter"
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Crossing Types</CardTitle>
        <CardDescription>Distribution of crossing types</CardDescription>
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
                data={crossingTypeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry: CrossingTypeDataEntry) => {
                  const type = entry.type;
                  // Type-safe approach using type assertion with a check
                  return type in chartConfig 
                    ? chartConfig[type as keyof typeof chartConfig]?.label 
                    : type;
                }}
                labelLine={true}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {trend.direction === "up" ? (
            <>
              Trending up by {trend.percentage}% this {trend.period} <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Trending down by {trend.percentage}% this {trend.period} <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Based on {crossingTypeData.reduce((sum, item) => sum + item.count, 0).toLocaleString()} total crossings
        </div>
      </CardFooter>
    </Card>
  );
}