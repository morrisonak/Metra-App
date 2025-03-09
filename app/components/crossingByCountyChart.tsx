
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data - replace with actual data in production
const countyData = [
  { county: 'Cook', crossings: 354 },
  { county: 'DuPage', crossings: 231 },
  { county: 'Lake', crossings: 187 },
  { county: 'Will', crossings: 152 },
  { county: 'Kane', crossings: 126 },
  { county: 'McHenry', crossings: 98 },
  { county: 'Kendall', crossings: 56 },
  { county: 'DeKalb', crossings: 44 },
];

interface CrossingsByCountyChartProps {
  detailed?: boolean;
  className?: string;
}

export function CrossingsByCountyChart({ detailed = false, className }: CrossingsByCountyChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={countyData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="county"
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value} crossings`, 'Count']}
            labelFormatter={(label) => `${label} County`}
          />
          <Bar 
            dataKey="crossings" 
            fill="hsl(var(--chart-1))" 
            label={{ 
              position: 'right', 
              formatter: (value) => value,
              fontSize: 12 
            }} 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}