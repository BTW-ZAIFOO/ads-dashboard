"use client";

import React from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SectionCards } from "@/components/section-cards";

// ✅ Detect ad platform based on campaign name
function detectPlatform(campaignName: string): string {
  const name = campaignName.toLowerCase();
  if (name.includes("meta")) return "Meta";
  if (name.includes("google")) return "Google";
  if (name.includes("facebook")) return "Facebook";
  if (name.includes("tiktok")) return "TikTok";
  if (name.includes("youtube")) return "YouTube";
  if (name.includes("twitter")) return "Twitter";
  return "Other";
}

type TableRow = {
  id: number;
  CampaignName: string;
  Platform: string;
  Impressions: string;
  Clicks: string;
  Conversions: string;
  Spend: string;
  Status: string;
};

export default function Page() {
  const [rows, setRows] = React.useState<TableRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const url = base
          ? `${base.replace(/\/$/, "")}/ads?limit=500`
          : "/api/ads?limit=500";

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch data.");

        const json = await res.json();
        const data = (json.data || []) as Array<{
          id: number;
          campaign_name: string;
          impressions: number;
          clicks: number;
          conversions: number;
          runrate: number;
        }>;

        const mapped = data.map((item, index) => ({
          id: item.id ?? index + 1,
          CampaignName: item.campaign_name,
          Platform: detectPlatform(item.campaign_name),
          Impressions: item.impressions.toLocaleString(),
          Clicks: item.clicks.toLocaleString(),
          Conversions: item.conversions.toLocaleString(),
          Spend: `$${(item.runrate * 10).toLocaleString()}`,
          Status: item.runrate > 55 ? "Active" : "Paused",
        }));

        setRows(mapped);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load ad data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <SectionCards />
                <ChartAreaInteractive />
              </div>

              <div className="px-4 lg:px-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading data...
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                  <DataTable data={rows} />
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
