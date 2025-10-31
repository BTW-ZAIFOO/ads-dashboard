"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"

interface DataPoint {
  [key: string]: string | number
}

interface SeriesConfig {
  accessor: string
  label: string
  type: "line" | "bar" | "area"
  color?: string
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DataPoint[]
  xAxis: string
  series: SeriesConfig[]
  height?: number
}

interface TooltipPayloadItem {
  value: number | string
  name: string
  color?: string
  stroke?: string
}

interface TooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  labelFormatter?: (value: string | number) => string
  className?: string
}

// Custom tooltip component
export const ChartTooltipContent = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ active, payload, label, labelFormatter, className }, ref) => {
    if (!active || !payload?.length) return null

    return (
      <div
        ref={ref}
        className={cn(
          "border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        <p className="text-muted-foreground">
          {labelFormatter && label ? labelFormatter(label) : label}
        </p>
        <div className="grid gap-0.5">
          {payload.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: item.color || item.stroke }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
              <span className="font-medium">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart component
export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ data, xAxis, series, height = 350, className, ...props }, ref) => {
    const chartType = series[0]?.type || "line"
    const ChartComponent = {
      line: LineChart,
      bar: BarChart,
      area: AreaChart,
    }[chartType]

    const DataComponent = {
      line: Line,
      bar: Bar,
      area: Area,
    }[chartType]

    return (
      <div ref={ref} className={className} {...props}>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xAxis} tickLine={false} />
            <YAxis tickLine={false} />
            <RechartsTooltip content={<ChartTooltipContent />} />
            {series.map((s) => (
              <DataComponent
                key={s.accessor}
                type="monotone"
                dataKey={s.accessor}
                name={s.label}
                stroke={s.color || "#8884d8"}
                fill={s.color || "#8884d8"}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    )
  }
)
Chart.displayName = "Chart"

export { RechartsTooltip as ChartTooltip }