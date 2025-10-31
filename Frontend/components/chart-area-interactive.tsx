"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
// Fetch from Supabase-backed API instead of local data

export interface ChartConfig {
  desktop: { color: string }
  mobile: { color: string }
}

export const description = "An interactive area chart"



const metrics = {
  impressions: { label: "Impressions", color: "#2563eb" },
  clicks: { label: "Clicks", color: "#16a34a" },
  conversions: { label: "Conversions", color: "#dc2626" },
  runrate: { label: "Run Rate", color: "#f59e0b" }
}

function parseDateSafe(dateString: string): Date | null {
  const direct = new Date(dateString)
  if (!isNaN(direct.getTime())) {
    // Normalize to start of day for consistent comparisons
    direct.setHours(0, 0, 0, 0)
    return direct
  }
  // Handle common date-only format YYYY-MM-DD
  const ymd = /^\d{4}-\d{2}-\d{2}$/
  if (ymd.test(dateString)) {
    const d = new Date(`${dateString}T00:00:00`)
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0)
      return d
    }
  }
  return null
}

function normalizeToYMD(dateString: string): string | null {
  // Try native/ISO first
  const d = new Date(dateString)
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear()
    const month = `${d.getMonth() + 1}`.padStart(2, "0")
    const day = `${d.getDate()}`.padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  // Try DD-MM-YYYY or DD/MM/YYYY or MM-DD-YYYY or MM/DD/YYYY heuristics
  const m = dateString.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (m) {
    const a = parseInt(m[1], 10)
    const b = parseInt(m[2], 10)
    const year = parseInt(m[3], 10)
    let month: number
    let day: number
    if (a > 12 && b <= 12) {
      // DD-MM-YYYY
      day = a; month = b
    } else if (b > 12 && a <= 12) {
      // MM-DD-YYYY
      month = a; day = b
    } else {
      // Ambiguous: default to DD-MM-YYYY
      day = a; month = b
    }
    const d2 = new Date(year, month - 1, day)
    if (!isNaN(d2.getTime())) {
      const mm = `${month}`.padStart(2, "0")
      const dd = `${day}`.padStart(2, "0")
      return `${year}-${mm}-${dd}`
    }
  }
  return null
}

function aggregateByDate(rows: Array<{ date: string; impressions: number; clicks: number; conversions: number; runrate: number }>) {
  const byDate: Record<string, { date: string; impressions: number; clicks: number; conversions: number; runrate: number }> = {}
  for (const r of rows) {
    const normalized = normalizeToYMD(r.date)
    const key = normalized || r.date
    if (!byDate[key]) {
      byDate[key] = { date: key, impressions: 0, clicks: 0, conversions: 0, runrate: 0 }
    }
    byDate[key].impressions += r.impressions
    byDate[key].clicks += r.clicks
    byDate[key].conversions += r.conversions
    byDate[key].runrate += r.runrate
  }
  return Object.values(byDate).sort((a, b) => {
    const da = parseDateSafe(normalizeToYMD(a.date) || a.date)
    const db = parseDateSafe(normalizeToYMD(b.date) || b.date)
    if (da && db) return da.getTime() - db.getTime()
    return a.date < b.date ? -1 : 1
  })
}

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("all")
  const [seriesData, setSeriesData] = React.useState<any[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
        const url = base ? `${base.replace(/\/$/, "")}/ads?limit=1000` : "/api/ads?limit=1000"
        const res = await fetch(url, { cache: "no-store" })
        const json = await res.json()
        const rows = (json.data || []) as Array<{ date: string; impressions: number; clicks: number; conversions: number; runrate: number }>
        setSeriesData(aggregateByDate(rows))
      } catch {
        setSeriesData([])
      }
    }
    load()
  }, [])

  const filteredData = React.useMemo(() => {
    if (timeRange === "all") return seriesData
    const days = parseInt(timeRange)
    if (isNaN(days)) return seriesData
    // Inclusive of today: last N days means today and previous (N-1) days
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (days - 1))
  const filtered = seriesData.filter((item) => {
      const normalized = normalizeToYMD(item.date)
      if (!normalized) return true // keep unparsable dates to avoid empty chart
      const d = parseDateSafe(normalized)
      if (!d) return true
      return d.getTime() >= startDate.getTime()
    })
    return filtered.length ? filtered : seriesData
  }, [timeRange, seriesData])

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle>Ad Performance Metrics</CardTitle>
        <CardDescription>
          <span className="hidden sm:block">
            Ad performance metrics over time
          </span>
          <span className="sm:hidden">Performance trends</span>
        </CardDescription>

        <CardAction className="flex items-center gap-2">
          {/* Desktop Toggle */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden md:flex space-x-2"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="7">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="15">Last 15 days</ToggleGroupItem>
            <ToggleGroupItem value="30">Last 30 days</ToggleGroupItem>
          </ToggleGroup>

          {/* Mobile Dropdown */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-40 md:hidden" size="sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="15">Last 15 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 min-w-0">
        <div className="aspect-auto h-[250px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              {/* Gradients for fills */}
              <defs>
                {Object.entries(metrics).map(([key, value]) => (
                  <linearGradient
                    key={key}
                    id={`fill${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={value.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={value.color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />

              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null

                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
                      <div className="text-[13px] font-medium text-muted-foreground">
                        {payload[0].payload.date}
                      </div>
                      <div className="mt-1 grid gap-2">
                        {payload.map((p: any) => (
                          <div
                            key={p.dataKey}
                            className="flex items-center gap-2 text-[13px]"
                          >
                            <div
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor:
                                  metrics[p.dataKey as keyof typeof metrics].color,
                              }}
                            />
                            <span className="text-muted-foreground">
                              {metrics[p.dataKey as keyof typeof metrics].label}:
                            </span>
                            <span className="font-medium tabular-nums">
                              {p.value.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />

              {Object.entries(metrics).map(([key, value]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={value.color}
                  fill={`url(#fill${key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChartAreaInteractive
