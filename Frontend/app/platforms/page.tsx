"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
  date?: string;
};

type PlatformSummary = {
  name: string;
  campaigns: number;
  totalSpend: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const platformApps: Record<string, string[]> = {
  Meta: ["Facebook", "Instagram", "Messenger", "WhatsApp", "Threads"],
  "Google Ads": ["YouTube", "Google Search", "Google Display"],
  TikTok: ["TikTok"],
  Twitter: ["X"],
  YouTube: ["YouTube"],
  Other: ["Other"],
};

function detectPlatform(name: string): string {
  const lower = name.toLowerCase();
  if (
    lower.includes("meta") ||
    lower.includes("facebook") ||
    lower.includes("instagram") ||
    lower.includes("messenger") ||
    lower.includes("whatsapp") ||
    lower.includes("threads")
  )
    return "Meta";
  if (lower.includes("google")) return "Google Ads";
  if (lower.includes("youtube")) return "YouTube";
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("twitter") || lower.includes("x")) return "Twitter";
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
  const map: Record<string, { spend: number; campaigns: Set<string> }> = {};
  for (const d of rows) {
    const platform = detectPlatform(d.campaign_name);
    if (!map[platform]) map[platform] = { spend: 0, campaigns: new Set() };
    map[platform].spend += d.runrate * 10;
    map[platform].campaigns.add(d.campaign_name);
  }
  return Object.entries(map).map(([name, v]) => ({
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

function getCampaignsByPlatform(rows: AdRow[]): Record<string, string[]> {
  const campaignsMap: Record<string, Set<string>> = {};
  
  for (const row of rows) {
    const platform = detectPlatform(row.campaign_name);
    if (!campaignsMap[platform]) {
      campaignsMap[platform] = new Set();
    }
    campaignsMap[platform].add(row.campaign_name);
  }
  
  const result: Record<string, string[]> = {};
  for (const [platform, campaignsSet] of Object.entries(campaignsMap)) {
    result[platform] = Array.from(campaignsSet).sort();
  }
  
  return result;
}

function filterDataForPlatform(rows: AdRow[], platform: string, campaign: string) {
  let filtered = rows.filter(row => detectPlatform(row.campaign_name) === platform);
  
  if (campaign !== "all") {
    filtered = filtered.filter(row => row.campaign_name === campaign);
  }
  
  return filtered;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A020F0",
  "#FF6699",
];

const CustomBarChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="platform" 
          axisLine={false}
          tickLine={false}
          className="text-sm"
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          className="text-sm"
        />
        <RechartTooltip
          contentStyle={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            border: "none",
          }}
          itemStyle={{ color: "#333", fontWeight: 500 }}
        />
        <Legend />
        <Bar 
          dataKey="impressions" 
          name="Impressions" 
          fill="#0088FE" 
          radius={[2, 2, 0, 0]}
          barSize={30}
        />
        <Bar 
          dataKey="clicks" 
          name="Clicks" 
          fill="#00C49F" 
          radius={[2, 2, 0, 0]}
          barSize={30} 
        />
        <Bar 
          dataKey="conversions" 
          name="Conversions" 
          fill="#FFBB28" 
          radius={[2, 2, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function PlatformsPage() {
  const [platforms, setPlatforms] = React.useState<PlatformSummary[]>([]);
  const [platformChartData, setPlatformChartData] = React.useState<any[]>([]);
  const [rawRows, setRawRows] = React.useState<AdRow[]>([]);
  const [days, setDays] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState("Meta");
  const [loading, setLoading] = React.useState(true);
  const [selectedCampaigns, setSelectedCampaigns] = React.useState<Record<string, string>>({});
  const [campaignsByPlatform, setCampaignsByPlatform] = React.useState<Record<string, string[]>>({});
  const [originalPlatforms, setOriginalPlatforms] = React.useState<PlatformSummary[]>([]);
  const [originalPlatformChartData, setOriginalPlatformChartData] = React.useState<any[]>([]);

  const pieData = React.useMemo(() => {
    return originalPlatforms.map((p) => ({
      name: p.name,
      value: parseFloat(p.totalSpend.replace(/[^0-9.]/g, "")) || 0,
    }));
  }, [originalPlatforms]);

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

        setRawRows(rows);
        const platformsData = buildPlatforms(rows);
        setPlatforms(platformsData);
        setOriginalPlatforms(platformsData);
        
        const chartData = buildPlatformChartData(rows);
        setPlatformChartData(chartData);
        setOriginalPlatformChartData(chartData);
        
        setCampaignsByPlatform(getCampaignsByPlatform(rows));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (!rawRows.length) return;
    
    let filtered = [...rawRows];

    if (days !== "all") {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - parseInt(days));
      filtered = rawRows.filter((r) => {
        if (!r.date) return true;
        return new Date(r.date) >= cutoff;
      });
    }

    setOriginalPlatforms(buildPlatforms(filtered));
    setOriginalPlatformChartData(buildPlatformChartData(filtered));

    const hasActiveCampaignFilters = Object.values(selectedCampaigns).some(
      campaign => campaign !== "all" && campaign !== undefined
    );

    if (hasActiveCampaignFilters) {
      const updatedPlatforms = [...originalPlatforms];
      const updatedChartData = [...originalPlatformChartData];

      Object.entries(selectedCampaigns).forEach(([platform, campaign]) => {
        if (campaign !== "all") {
          const platformData = filterDataForPlatform(filtered, platform, campaign);
          const platformSummary = buildPlatforms(platformData);
          const platformChart = buildPlatformChartData(platformData);

          const platformIndex = updatedPlatforms.findIndex(p => p.name === platform);
          if (platformIndex !== -1 && platformSummary.length > 0) {
            updatedPlatforms[platformIndex] = platformSummary[0];
          }

          const chartIndex = updatedChartData.findIndex(d => d.platform === platform);
          if (chartIndex !== -1 && platformChart.length > 0) {
            updatedChartData[chartIndex] = platformChart[0];
          }
        }
      });

      setPlatforms(updatedPlatforms);
      setPlatformChartData(updatedChartData);
    } else {
      setPlatforms(buildPlatforms(filtered));
      setPlatformChartData(buildPlatformChartData(filtered));
    }
  }, [days, rawRows, selectedCampaigns]);

  const handleCampaignChange = (platform: string, campaign: string) => {
    setSelectedCampaigns(prev => ({
      ...prev,
      [platform]: campaign
    }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading platform data...
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl font-bold tracking-tight">
          Ad Platforms Overview
        </h2>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {originalPlatforms.map((p) => {
          const Icon = p.icon;
          return (
            <Card
              key={p.name}
              className="p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all bg-white"
            >
              <div className="flex items-center space-x-2">
                <Icon size={22} />
                <h3 className="text-lg font-semibold">{p.name}</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
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

      <div className="bg-muted/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
        <h4 className="text-lg font-semibold mb-4 text-center">
          Platform Spend Comparison
        </h4>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient
                  key={index}
                  id={`grad-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={5}
              cornerRadius={6}
              label={(props) => {
                const { name, percent } = props as {
                  name: string;
                  percent?: number;
                };
                return `${name} ${((percent ?? 0) * 100).toFixed(0)}%`;
              }}
              labelLine={false}
              isAnimationActive
            >
              {pieData.map((_, index) => (
                <Cell
                  key={index}
                  fill={`url(#grad-${index % COLORS.length})`}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <RechartTooltip
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                border: "none",
              }}
              itemStyle={{ color: "#333", fontWeight: 500 }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ marginTop: "15px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <Card className="p-6 rounded-2xl shadow-sm border">
        <h3 className="text-xl font-semibold">
          Platform Insights ({days === "all" ? "All Time" : `Last ${days} Days`}
          )
        </h3>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="flex flex-wrap gap-2 bg-muted/30 rounded-lg p-2">
            {originalPlatforms.map((p) => (
              <TabsTrigger
                key={p.name}
                value={p.name}
                className="rounded-lg p-4 data-[state=active]:bg-gray-300 data-[state=active]:shadow-sm"
              >
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {originalPlatforms.map((p) => {
            const apps = platformApps[p.name] || ["Other"];
            const data = platformChartData.filter((d) => d.platform === p.name);
            const platformCampaigns = campaignsByPlatform[p.name] || [];
            const selectedCampaign = selectedCampaigns[p.name] || "all";

            return (
              <TabsContent
                key={p.name}
                value={p.name}
                className="mt-6 space-y-6"
              >
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Campaign:
                  </label>
                  <Select
                    value={selectedCampaign}
                    onValueChange={(value) => handleCampaignChange(p.name, value)}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="All Campaigns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns</SelectItem>
                      {platformCampaigns.map((campaign) => (
                        <SelectItem key={campaign} value={campaign}>
                          {campaign}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {apps.map((app) => (
                    <Card
                      key={app}
                      className="p-4 border hover:shadow-md transition rounded-xl"
                    >
                      <h4 className="text-md font-semibold">{app}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Insights and ad metrics for {app}.
                      </p>
                    </Card>
                  ))}
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                  <h4 className="text-lg font-semibold mb-3">
                    {p.name} Performance
                    {selectedCampaign !== "all" && ` - ${selectedCampaign}`}
                  </h4>
                  <CustomBarChart data={data} />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>
    </div>
  );
}