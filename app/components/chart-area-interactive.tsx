// app/components/chart-area-interactive.tsx


import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "~/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"

const chartConfig = {
  management: {
    label: "Management",
    color: "hsl(var(--chart-1))",
  },
  represented: {
    label: "Represented",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface ChartData {
  date: string;
  management: number;
  represented: number;
}

interface ChartAreaInteractiveProps {
  chartData?: ChartData[];
  success?: boolean;
  error?: string;
  lastUpdated?: string;
}

export function ChartAreaInteractive({ 
  chartData = [], 
  success = true, 
  error = null, 
  lastUpdated 
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Filter data based on selected time range (relative to today)
  const filteredData = React.useMemo(() => {
    if (!chartData.length) return []
    
    const today = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - daysToSubtract)
    
    return chartData.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate && itemDate <= today
    })
  }, [chartData, timeRange])

  // Calculate total inspections for the current period
  const totalInspections = React.useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.management + item.represented, 0)
  }, [filteredData])

  // Show error state if data loading failed
  if (!success) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Total Inspections</CardTitle>
          <CardDescription>Unable to load inspection data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="text-center text-muted-foreground">
            <p>Error loading data: {error}</p>
            <p className="text-sm mt-2">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Total Inspections</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            {totalInspections} inspections completed
            {lastUpdated && (
              <> • Last updated {new Date(lastUpdated).toLocaleDateString()}</>
            )}
          </span>
          <span className="@[540px]/card:hidden">
            {totalInspections} inspections
          </span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillManagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-management)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-management)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillRepresented" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-represented)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-represented)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area 
              dataKey="represented" 
              type="natural" 
              fill="url(#fillRepresented)" 
              stroke="var(--color-represented)" 
              stackId="a" 
            />
            <Area 
              dataKey="management" 
              type="natural" 
              fill="url(#fillManagement)" 
              stroke="var(--color-management)" 
              stackId="a" 
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}