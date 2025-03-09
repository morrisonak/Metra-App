import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Risk assessment data
const riskData = [
  { month: "January", highRisk: 18, mediumRisk: 24 },
  { month: "February", highRisk: 15, mediumRisk: 28 },
  { month: "March", highRisk: 12, mediumRisk: 30 },
  { month: "April", highRisk: 10, mediumRisk: 33 },
  { month: "May", highRisk: 8, mediumRisk: 25 },
  { month: "June", highRisk: 7, mediumRisk: 20 },
];

export function RiskAssessmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Trend</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={riskData}
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
                width={35}
              />
              <Line
                dataKey="highRisk"
                name="High Risk"
                type="monotone"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--destructive))",
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
                />
              </Line>
              <Line
                dataKey="mediumRisk"
                name="Medium Risk"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--chart-2))",
                  r: 4
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none text-green-500">
          <AlertTriangle className="h-4 w-4" /> High risk crossings trending down by 15.4% 
          <TrendingDown className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Based on FRA Accident Prediction and Severity (APS) model
        </div>
      </CardFooter>
    </Card>
  );
}