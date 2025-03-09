import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Compliance data
const complianceData = [
  { month: "January", compliance: 92.4, target: 95.0 },
  { month: "February", compliance: 93.1, target: 95.0 },
  { month: "March", compliance: 93.5, target: 96.0 },
  { month: "April", compliance: 94.2, target: 96.0 },
  { month: "May", compliance: 94.9, target: 97.0 },
  { month: "June", compliance: 95.3, target: 97.0 },
  { month: "July", compliance: 95.7, target: 98.0 },
  { month: "August", compliance: 96.0, target: 98.0 },
  { month: "September", compliance: 96.5, target: 99.0 },
  { month: "October", compliance: 97.1, target: 99.0 },
  { month: "November", compliance: 97.8, target: 99.0 },
  { month: "December", compliance: 98.2, target: 99.0 },
];

export function ComplianceRateChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Rate Trend</CardTitle>
        <CardDescription>Monthly compliance rate (2024)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={complianceData}
              margin={{
                top: 20,
                left: 12,
                right: 12,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[90, 100]}
                tickFormatter={(value) => `${value}%`}
                width={45}
              />
              <Line
                dataKey="compliance"
                name="Compliance Rate"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--chart-1))",
                  r: 4
                }}
                activeDot={{
                  r: 6,
                }}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value) => `${value}%`}
                />
              </Line>
              <Line
                dataKey="target"
                name="Target Rate"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none text-green-500">
          Trending up by 5.8% year-to-date <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Goal: 99% compliance by end of year
        </div>
      </CardFooter>
    </Card>
  );
}