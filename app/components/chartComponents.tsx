// ChartConfig type definition
export type ChartConfig = Record<
  string,
  {
    label: string;
    color?: string;
  }
>;

// Chart Container Component
import React, { createContext, useContext } from "react";
import { cn } from "~/lib/utils";

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

const ChartContext = createContext<ChartConfig>({});

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  // Setup CSS variables based on chart config colors
  const style = Object.entries(config).reduce(
    (acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}`] = value.color;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <ChartContext.Provider value={config}>
      <div
        className={cn("w-full [&_.recharts-tooltip-cursor]:fill-transparent", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

// Chart Tooltip Components
import { useId } from "react";
import type { TooltipProps } from "recharts";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      fill?: string;
      [key: string]: any;
    };
  }>;
  label?: string;
  hideLabel?: boolean;
}

export function ChartTooltip({
  content,
  ...props
}: TooltipProps<any, any> & { content: React.ReactNode }) {
  const id = useId();

  return (
    <foreignObject className="overflow-visible">
      <div id={`${id}-tooltip`} className="absolute left-0 top-0 z-50">
        {content}
      </div>
    </foreignObject>
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
}: ChartTooltipContentProps) {
  const config = useContext(ChartContext);

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      {!hideLabel && <div className="mb-1 font-medium">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => {
          const configKey = item.name?.toLowerCase() || "";
          const configItem = config[configKey];
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.payload.fill || configItem?.color || "currentColor",
                }}
              />
              <span className="font-medium">
                {configItem?.label || item.name}:
              </span>
              <span>{item.value.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}