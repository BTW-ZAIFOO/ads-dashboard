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
    date: d.date.split("T")[0], 
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

function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999); 
  
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function fillMissingDates(performance: any[], days: number) {
  const allDates = getLastNDates(days);
  const dateMap = new Map(performance.map((d) => [d.date, d]));

  return allDates.map((date) => {
    if (dateMap.has(date)) return dateMap.get(date);
    return {
      date,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cvr: 0,
    };
  });
}

function filterPerformanceByDate(performance: any[], selectedRange: string) {
  if (selectedRange === "all") {
    return performance;
  }

  const days = selectedRange === "7days" ? 7 : 
               selectedRange === "30days" ? 30 : 90;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0); 

  return performance.filter((d) => {
    const itemDate = new Date(d.date);
    return itemDate >= cutoffDate;
  });
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = React.useState({
    performance: [] as any[],
    platforms: {} as Record<string, any>,
  });

  const [filteredData, setFilteredData] = React.useState({
    performance: [] as any[],
    platforms: {} as Record<string, any>,
  });

  const [selectedRange, setSelectedRange] = React.useState("7days");

  React.useEffect(() => {
    const load = async () => {
      try {
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
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      }
    };

    load();
  }, []);

  React.useEffect(() => {
    if (!analyticsData.performance.length) {
      return;
    }

    let filteredPerformance = filterPerformanceByDate(
      analyticsData.performance, 
      selectedRange
    );

    if (selectedRange !== "all") {
      const days = selectedRange === "7days" ? 7 : 
                   selectedRange === "30days" ? 30 : 90;
      filteredPerformance = fillMissingDates(filteredPerformance, days);
    }

    // FIX: Create a new sorted array instead of sorting in-place
    const sortedPerformance = [...filteredPerformance].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const originalFilteredRows = analyticsData.performance.filter(item => {
      if (selectedRange === "all") return true;
      
      const days = selectedRange === "7days" ? 7 : 
                   selectedRange === "30days" ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0);
      
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });

    const filteredAnalytics = buildAnalytics(originalFilteredRows);
    filteredAnalytics.performance = sortedPerformance; // Use the sorted copy

    setFilteredData(filteredAnalytics);
  }, [selectedRange, analyticsData]);

  const platformChartData = React.useMemo(() => {
    return Object.entries(filteredData.platforms).map(
      ([platform, data]: any) => ({
        platform,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        ctr: data.impressions ? (data.clicks / data.impressions) * 100 : 0,
      })
    );
  }, [filteredData.platforms]);

  const summaryMetrics = React.useMemo(() => {
    const totalImpressions = filteredData.performance.reduce((a, b) => a + b.impressions, 0);
    const totalClicks = filteredData.performance.reduce((a, b) => a + b.clicks, 0);
    const totalConversions = filteredData.performance.reduce((a, b) => a + b.conversions, 0);
    
    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      ctr: totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0%",
    };
  }, [filteredData.performance]);

  // Individual metric cards with their own graphs
  const metricCards = [
    {
      title: "Total Impressions",
      value: summaryMetrics.impressions,
      data: filteredData.performance,
      accessor: "impressions",
      chartTitle: "Impressions Over Time",
      color: "hsl(221.2 83.2% 53.3%)",
    },
    {
      title: "Total Clicks",
      value: summaryMetrics.clicks,
      data: filteredData.performance,
      accessor: "clicks",
      chartTitle: "Clicks Over Time",
      color: "hsl(142.1 76.2% 36.3%)",
    },
    {
      title: "Total Conversions",
      value: summaryMetrics.conversions,
      data: filteredData.performance,
      accessor: "conversions",
      chartTitle: "Conversions Over Time",
      color: "hsl(346.8 77.2% 49.8%)",
    },
    {
      title: "Average CTR",
      value: summaryMetrics.ctr,
      data: filteredData.performance,
      accessor: "ctr",
      chartTitle: "CTR Over Time",
      color: "hsl(262.1 83.3% 57.8%)",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Performance Analytics
        </h2>

        <div className="flex items-center space-x-2">
          <Select
            value={selectedRange}
            onValueChange={(value) => setSelectedRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Individual metric cards with graphs - Improved spacing and sizing */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {metricCards.map((item) => (
          <Card key={item.title} className="p-6 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="text-3xl font-bold">
                  {typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
                </p>
              </div>
              
              {/* Individual graph for each metric with proper container */}
              <div className="flex-1 min-h-0">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">{item.chartTitle}</h4>
                <div className="h-auto w-full">
                  <Chart
                    data={item.data}
                    xAxis="date"
                    series={[
                      { 
                        accessor: item.accessor, 
                        label: item.title.replace("Total ", "").replace("Average ", ""), 
                        type: "line",
                        color: item.color,
                      },
                    ]}
                    height={192}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Original combined performance trends chart */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Performance Trends</h3>
          <div className="h-auto w-full">
            <Chart
              data={filteredData.performance}
              xAxis="date"
              series={[
                { accessor: "impressions", label: "Impressions", type: "line", color: "hsl(221.2 83.2% 53.3%)" },
                { accessor: "clicks", label: "Clicks", type: "line", color: "hsl(142.1 76.2% 36.3%)" },
                { accessor: "conversions", label: "Conversions", type: "line", color: "hsl(346.8 77.2% 49.8%)" },
              ]}
              height={320}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Platform Performance</h3>
            <div className="h-auto w-full">
              <Chart
                data={platformChartData}
                xAxis="platform"
                series={[
                  { accessor: "impressions", label: "Impressions", type: "bar", color: "hsl(221.2 83.2% 53.3%)" },
                  { accessor: "clicks", label: "Clicks", type: "bar", color: "hsl(142.1 76.2% 36.3%)" },
                  { accessor: "conversions", label: "Conversions", type: "bar", color: "hsl(346.8 77.2% 49.8%)" },
                ]}
                height={320}
              />
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Conversion Rates</h3>
            <div className="h-auto w-full">
              <Chart
                data={filteredData.performance}
                xAxis="date"
                series={[
                  { accessor: "ctr", label: "CTR %", type: "line", color: "hsl(262.1 83.3% 57.8%)" },
                  { accessor: "cvr", label: "CVR %", type: "line", color: "hsl(47.9 95.8% 53.1%)" },
                ]}
                height={320}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}