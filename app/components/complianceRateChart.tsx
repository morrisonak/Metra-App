

interface ComplianceRateChartProps {
  detailed?: boolean;
}

export function ComplianceRateChart({ detailed = false }: ComplianceRateChartProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-muted-foreground">
        {detailed ? 
          "Detailed compliance rate chart with breakdown by categories would render here" : 
          "Line chart showing compliance rate trends would render here"}
      </div>
    </div>
  );
}