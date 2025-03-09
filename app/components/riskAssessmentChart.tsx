

interface RiskAssessmentChartProps {
  detailed?: boolean;
}

export function RiskAssessmentChart({ detailed = false }: RiskAssessmentChartProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-muted-foreground">
        {detailed ? 
          "Detailed risk assessment chart with breakdown by categories would render here" : 
          "Pie chart showing risk assessment distribution would render here"}
      </div>
    </div>
  );
}