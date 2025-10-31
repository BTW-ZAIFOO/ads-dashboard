"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import {
  IconBrandGoogle,
  IconBrandMeta,
  IconBrandFacebook,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconApps,
} from "@tabler/icons-react";

type AdRow = {
  campaign_name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  runrate: number;
};

type PlatformSummary = {
  name: string;
  campaigns: number;
  totalSpend: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

function detectPlatform(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("google")) return "Google Ads";
  if (lower.includes("meta")) return "Meta";
  if (lower.includes("facebook")) return "Facebook";
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("youtube")) return "YouTube";
  if (lower.includes("twitter")) return "Twitter";
  return "Other";
}

const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "Google Ads": IconBrandGoogle,
  Meta: IconBrandMeta,
  Facebook: IconBrandFacebook,
  TikTok: IconBrandTiktok,
  Twitter: IconBrandX,
  YouTube: IconBrandYoutube,
  Other: IconApps,
};

function buildPlatforms(rows: AdRow[]): PlatformSummary[] {
  const platformAggMap: Record<
    string,
    { spend: number; campaigns: Set<string> }
  > = {};

  for (const d of rows) {
    const platform = detectPlatform(d.campaign_name);
    if (!platformAggMap[platform]) {
      platformAggMap[platform] = { spend: 0, campaigns: new Set() };
    }
    platformAggMap[platform].spend += d.runrate * 10;
    platformAggMap[platform].campaigns.add(d.campaign_name);
  }

  return Object.entries(platformAggMap).map(([name, v]) => ({
    name,
    campaigns: v.campaigns.size,
    totalSpend: `$${Math.round(v.spend).toLocaleString()}`,
    icon: iconMap[name] || iconMap.Other,
  }));
}

function buildPlatformChartData(rows: AdRow[]) {
  const agg: Record<
    string,
    {
      platform: string;
      impressions: number;
      clicks: number;
      conversions: number;
    }
  > = {};

  for (const d of rows) {
    const platform = detectPlatform(d.campaign_name);
    if (!agg[platform]) {
      agg[platform] = { platform, impressions: 0, clicks: 0, conversions: 0 };
    }
    agg[platform].impressions += d.impressions || 0;
    agg[platform].clicks += d.clicks || 0;
    agg[platform].conversions += d.conversions || 0;
  }

  return Object.values(agg);
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = React.useState<PlatformSummary[]>([]);
  const [platformChartData, setPlatformChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const url = base
          ? `${base.replace(/\/$/, "")}/ads?limit=1000`
          : "/api/ads?limit=1000";

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch data");

        const json = await res.json();
        const rows = (json.data || []) as AdRow[];

        setPlatforms(buildPlatforms(rows));
        setPlatformChartData(buildPlatformChartData(rows));
      } catch (err) {
        console.error("Error fetching data:", err);
        setPlatforms([]);
        setPlatformChartData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading platform data...
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ad Platforms</h2>
      </div>

      {/* Platform Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.name} className="p-4 transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon size={22} />
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                  <p className="text-base font-medium">{p.campaigns}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spend</p>
                  <p className="text-base font-medium">{p.totalSpend}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card>
        <div className="p-4 min-w-0">
          <h3 className="text-xl font-semibold mb-4">Platform Comparison</h3>
          <div className="min-w-0">
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
        </div>
      </Card>
    </div>
  );
}
