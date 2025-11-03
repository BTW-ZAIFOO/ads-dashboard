"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function detectPlatform(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("google")) return "google";
  if (lower.includes("meta")) return "meta";
  if (lower.includes("facebook")) return "facebook";
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("youtube")) return "youtube";
  return "other";
}

function buildAnalytics(
  rows: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    campaign_name: string;
  }>
) {
  const performance = rows.map((d) => ({
    date: d.date,
    impressions: d.impressions,
    clicks: d.clicks,
    conversions: d.conversions,
    ctr: d.impressions ? (d.clicks / d.impressions) * 100 : 0,
    cvr: d.clicks ? (d.conversions / d.clicks) * 100 : 0,
  }));

  const platformsAgg: Record<
    string,
    { impressions: number; clicks: number; conversions: number }
  > = {};

  for (const d of rows) {
    const platform = detectPlatform(d.campaign_name || "");
    if (!platformsAgg[platform]) {
      platformsAgg[platform] = { impressions: 0, clicks: 0, conversions: 0 };
    }

    platformsAgg[platform].impressions += d.impressions;
    platformsAgg[platform].clicks += d.clicks;
    platformsAgg[platform].conversions += d.conversions;
  }

  return { performance, platforms: platformsAgg };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = React.useState({
    performance: [] as any[],
    platforms: {} as Record<string, any>,
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
        date: string;
        impressions: number;
        clicks: number;
        conversions: number;
        campaign_name: string;
      }>;
      setAnalyticsData(buildAnalytics(rows));
    };

    load();
  }, []);

  const platformChartData = React.useMemo(() => {
    return Object.entries(analyticsData.platforms).map(
      ([platform, data]: any) => ({
        platform,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        ctr: data.impressions ? (data.clicks / data.impressions) * 100 : 0,
      })
    );
  }, [analyticsData.platforms]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Performance Analytics
        </h2>

        <div className="flex items-center space-x-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Impressions</p>
            <p className="text-2xl font-bold">
              {analyticsData.performance
                .reduce((a, b) => a + b.impressions, 0)
                .toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="text-2xl font-bold">
              {analyticsData.performance
                .reduce((a, b) => a + b.clicks, 0)
                .toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Conversions</p>
            <p className="text-2xl font-bold">
              {analyticsData.performance
                .reduce((a, b) => a + b.conversions, 0)
                .toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Average CTR</p>
            <p className="text-2xl font-bold">
              {(() => {
                const totalImpr = analyticsData.performance.reduce(
                  (a, b) => a + b.impressions,
                  0
                );
                const totalClicks = analyticsData.performance.reduce(
                  (a, b) => a + b.clicks,
                  0
                );
                return totalImpr
                  ? ((totalClicks / totalImpr) * 100).toFixed(2) + "%"
                  : "0%";
              })()}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 min-w-0">
          <h3 className="text-xl font-semibold mb-4">Performance Trends</h3>
          <Chart
            data={analyticsData.performance}
            xAxis="date"
            series={[
              { accessor: "impressions", label: "Impressions", type: "line" },
              { accessor: "clicks", label: "Clicks", type: "line" },
              { accessor: "conversions", label: "Conversions", type: "line" },
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="p-4 min-w-0">
            <h3 className="text-xl font-semibold mb-4">Platform Performance</h3>
            <Chart
              data={platformChartData}
              xAxis="platform"
              series={[
                { accessor: "impressions", label: "Impressions", type: "bar" },
                { accessor: "clicks", label: "Clicks", type: "bar" },
                { accessor: "conversions", label: "Conversions", type: "bar" },
              ]}
            />
          </div>
        </Card>

        <Card>
          <div className="p-4 min-w-0">
            <h3 className="text-xl font-semibold mb-4">Conversion Rates</h3>
            <Chart
              data={analyticsData.performance}
              xAxis="date"
              series={[
                { accessor: "ctr", label: "CTR %", type: "line" },
                { accessor: "cvr", label: "CVR %", type: "line" },
              ]}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
