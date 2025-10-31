import { IconTrendingUp } from "@tabler/icons-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import React from "react"

export function SectionCards() {
  const [totals, setTotals] = React.useState({ impressions: 0, clicks: 0, conversions: 0, spend: 0 })

  React.useEffect(() => {
    const load = async () => {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
      const url = base ? `${base.replace(/\/$/, "")}/ads?limit=1000` : "/api/ads?limit=1000"
      const res = await fetch(url, { cache: "no-store" })
      const json = await res.json()
      const rows = (json.data || []) as Array<{ impressions: number; clicks: number; conversions: number; runrate: number }>
      const agg = rows.reduce(
        (acc, d) => {
          acc.impressions += d.impressions
          acc.clicks += d.clicks
          acc.conversions += d.conversions
          acc.spend += d.runrate * 10
          return acc
        },
        { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
      )
      setTotals(agg)
    }
    load()
  }, [])

  const totalsComputed = totals

  const avgCtr = totalsComputed.impressions ? (totalsComputed.clicks / totalsComputed.impressions) * 100 : 0
  const roas = totalsComputed.spend ? (totalsComputed.conversions * 10) / totalsComputed.spend : 0
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 py-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ad Spend</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${totalsComputed.spend.toFixed(2)}
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Aggregated across campaigns <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Conversions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalsComputed.conversions.toLocaleString()}
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong conversion volume <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Click-Through Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {avgCtr.toFixed(2)}%
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Engagement across channels <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>ROAS</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {roas.toFixed(2)}x
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Return on Ad Spend <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
