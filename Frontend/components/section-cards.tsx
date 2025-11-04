"use client";

import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

export function SectionCards() {
  const [totals, setTotals] = React.useState({
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
  });
  const [previousTotals, setPreviousTotals] = React.useState({
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
  });

  React.useEffect(() => {
    const load = async () => {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const url = base
        ? `${base.replace(/\/$/, "")}/ads?limit=1000`
        : "/api/ads?limit=1000";
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      const rows = (json.data || []) as Array<{
        impressions: number;
        clicks: number;
        conversions: number;
        runrate: number;
      }>;

      const agg = rows.reduce(
        (acc, d) => {
          acc.impressions += d.impressions;
          acc.clicks += d.clicks;
          acc.conversions += d.conversions;
          acc.spend += d.runrate * 10;
          return acc;
        },
        { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
      );

      setPreviousTotals(totals); 
      setTotals(agg);
    };

    load();
  }, []);

  const avgCtr = totals.impressions
    ? (totals.clicks / totals.impressions) * 100
    : 0;
  const roas = totals.spend ? (totals.conversions * 10) / totals.spend : 0;

  const trend = {
    spend: totals.spend >= previousTotals.spend,
    conversions: totals.conversions >= previousTotals.conversions,
    ctr:
      (totals.clicks / totals.impressions || 0) >=
      (previousTotals.clicks / previousTotals.impressions || 0),
    roas:
      (totals.conversions / totals.spend || 0) >=
      (previousTotals.conversions / previousTotals.spend || 0),
  };

  const Arrow = ({ up }: { up: boolean }) =>
    up ? (
      <IconTrendingUp className="size-4 text-green-500" />
    ) : (
      <IconTrendingDown className="size-4 text-red-500" />
    );

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 py-4">
      {/* Spend */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ad Spend</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${totals.spend.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Aggregated across campaigns
            <Arrow up={trend.spend} />
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Conversions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals.conversions.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Strong conversion volume
            <Arrow up={trend.conversions} />
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Click-Through Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {avgCtr.toFixed(2)}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Engagement across channels
            <Arrow up={trend.ctr} />
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>ROAS</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {roas.toFixed(2)}x
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Return on Ad Spend
            <Arrow up={trend.roas} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
