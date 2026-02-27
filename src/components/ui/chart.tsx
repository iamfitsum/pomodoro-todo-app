"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "~/utils/utils";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const toStartCase = (value: string) =>
  value.length > 0 ? value[0]!.toUpperCase() + value.slice(1) : value;

function ChartContainer({
  id,
  className,
  children,
  config,
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const chartId = React.useId().replace(/:/g, "");
  const resolvedId = `chart-${id ?? chartId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={resolvedId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-slate-500 " +
            "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-slate-200 " +
            "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-slate-200 " +
            "dark:[&_.recharts-cartesian-axis-tick_text]:fill-slate-400 " +
            "dark:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-slate-800 " +
            "dark:[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-slate-800",
          className
        )}
        style={
          Object.entries(config).reduce((acc, [key, value]) => {
            if (!value?.color) return acc;
            return {
              ...acc,
              [`--color-${key}`]: value.color,
            };
          }, {} as React.CSSProperties)
        }
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  className?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "grid min-w-[8rem] gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-xl dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      {payload.map((item) => {
        const key = String(item.dataKey ?? "");
        const rawPayload = (item.payload ?? {}) as Record<string, unknown>;
        const priorityKey =
          typeof rawPayload.priority === "string" ? rawPayload.priority : null;
        const totalForSlice =
          typeof rawPayload.__total === "number" ? rawPayload.__total : null;
        const label = priorityKey
          ? (config[priorityKey]?.label ?? toStartCase(priorityKey))
          : (config[key]?.label ?? toStartCase(key));
        const isSliceCount =
          totalForSlice !== null && typeof item.value === "number";
        const valueText = isSliceCount
          ? `${item.value} of ${totalForSlice}`
          : String(item.value ?? "");
        return (
          <div key={key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color ?? "currentColor" }}
              />
              <span className="text-slate-600 dark:text-slate-300">{label}</span>
            </div>
            <span className="font-medium tabular-nums text-slate-900 dark:text-slate-50">
              {valueText}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
