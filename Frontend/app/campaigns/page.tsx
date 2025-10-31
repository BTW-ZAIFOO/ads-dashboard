"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ✅ Helper function to identify ad platform
function detectPlatform(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("google")) return "Google";
  if (lower.includes("meta")) return "Meta";
  if (lower.includes("facebook")) return "Facebook";
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("youtube")) return "YouTube";
  if (lower.includes("twitter")) return "Twitter";
  return "Other";
}

// ✅ Map Supabase rows into display-ready campaign data
function mapRows(
  rows: Array<{
    id?: number;
    campaign_name: string;
    impressions: number;
    clicks: number;
    runrate: number;
  }>
) {
  return rows.map((d, idx) => {
    const ctr = d.impressions ? (d.clicks / d.impressions) * 100 : 0;
    const spent = d.runrate * 10;
    const budget = d.runrate * 20;
    return {
      id: d.id ?? idx + 1,
      name: d.campaign_name,
      platform: detectPlatform(d.campaign_name),
      status: d.runrate > 55 ? "Active" : "Paused",
      budget: `$${budget.toLocaleString()}`,
      spent: `$${spent.toLocaleString()}`,
      impressions: d.impressions.toLocaleString(),
      clicks: d.clicks.toLocaleString(),
      ctr: `${ctr.toFixed(2)}%`,
    };
  });
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<
    Array<ReturnType<typeof mapRows>[number]>
  >([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const url = base
          ? `${base.replace(/\/$/, "")}/ads?limit=1000`
          : "/api/ads?limit=1000";
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch campaigns.");
        const json = await res.json();
        const rows = (json.data || []) as Array<{
          id?: number;
          campaign_name: string;
          impressions: number;
          clicks: number;
          runrate: number;
        }>;
        setCampaigns(mapRows(rows));
      } catch (err) {
        console.error("Error loading campaigns:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Table */}
      <Card className="overflow-hidden">
        <div className="p-4">
          <div className="relative w-full overflow-auto rounded-lg">
            <table className="w-full caption-bottom text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="h-12 px-4 text-left font-medium">Campaign</th>
                  <th className="h-12 px-4 text-left font-medium">Platform</th>
                  <th className="h-12 px-4 text-left font-medium">Status</th>
                  <th className="h-12 px-4 text-left font-medium">Budget</th>
                  <th className="h-12 px-4 text-left font-medium">Spent</th>
                  <th className="h-12 px-4 text-left font-medium">
                    Impressions
                  </th>
                  <th className="h-12 px-4 text-left font-medium">Clicks</th>
                  <th className="h-12 px-4 text-left font-medium">CTR</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium">{campaign.name}</td>
                    <td className="p-4">{campaign.platform}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          campaign.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="p-4">{campaign.budget}</td>
                    <td className="p-4">{campaign.spent}</td>
                    <td className="p-4">{campaign.impressions}</td>
                    <td className="p-4">{campaign.clicks}</td>
                    <td className="p-4">{campaign.ctr}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {campaigns.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No campaigns available.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
