"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";

/* --------------------------------------------------------------------------
  🎯 Function: detectPlatform
  Identifies the advertising platform based on the campaign name string.
  Used to group data and calculate per-platform budgets.
-------------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------------
  📊 Function: computeAggregates
  - Calculates platform-level and monthly-level spend and budget data.
  - Returns aggregate stats including totals and structured chart data.
-------------------------------------------------------------------------- */
function computeAggregates(
  rows: Array<{ date: string; campaign_name: string; runrate: number }>
) {
  // 🧮 Platform-level aggregation
  const platformSpendMap: Record<string, { allocated: number; spent: number }> =
    {};

  for (const d of rows) {
    const platform = detectPlatform(d.campaign_name);

    // Initialize if platform not found
    if (!platformSpendMap[platform])
      platformSpendMap[platform] = { allocated: 0, spent: 0 };

    // Example logic: spent = runrate * 10, allocated = runrate * 20
    platformSpendMap[platform].spent += d.runrate * 10;
    platformSpendMap[platform].allocated += d.runrate * 20;
  }

  // Convert to chart-friendly array format
  const platformSpend = Object.entries(platformSpendMap).map(
    ([platform, v]) => ({
      platform,
      allocated: Math.round(v.allocated),
      spent: Math.round(v.spent),
    })
  );

  // 📅 Monthly aggregation
  const byMonth: Record<string, { budget: number; spent: number }> = {};

  for (const d of rows) {
    const dt = new Date(d.date);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!byMonth[key]) byMonth[key] = { budget: 0, spent: 0 };

    byMonth[key].budget += d.runrate * 20;
    byMonth[key].spent += d.runrate * 10;
  }

  // Convert monthly data into an array sorted by date
  const budgetMonthly = Object.entries(byMonth)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, v]) => ({
      month: key,
      budget: Math.round(v.budget),
      spent: Math.round(v.spent),
    }));

  // 💰 Totals
  const totalBudget = platformSpend.reduce(
    (acc, curr) => acc + curr.allocated,
    0
  );
  const totalSpent = platformSpend.reduce((acc, curr) => acc + curr.spent, 0);

  return { platformSpend, budgetMonthly, totalBudget, totalSpent };
}

/* --------------------------------------------------------------------------
  💼 Component: BudgetPage
  Displays an overview of advertising budgets, spend trends, and per-platform stats.
-------------------------------------------------------------------------- */
export default function BudgetPage() {
  // 📦 Local state for computed data
  const [state, setState] = React.useState(() => ({
    platformSpend: [] as any[],
    budgetMonthly: [] as any[],
    totalBudget: 0,
    totalSpent: 0,
  }));

  // 🚀 Fetch data from API (Supabase endpoint or local API)
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
        campaign_name: string;
        runrate: number;
      }>;

      // Compute and set aggregates
      setState(computeAggregates(rows));
    };
    load();
  }, []);

  // Destructure computed values
  const { platformSpend, budgetMonthly, totalBudget, totalSpent } = state;

  /* ------------------------------------------------------------------------
    🧭 Render Layout
    - Top cards show totals
    - Charts display trends and platform-level spend
  ------------------------------------------------------------------------ */
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Budget & Spend</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Budget */}
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">
              ${totalBudget.toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Total Spent */}
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
          </div>
        </Card>

        {/* Remaining Budget */}
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold">
              ${(totalBudget - totalSpent).toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Spend Rate */}
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Spend Rate</p>
            <p className="text-2xl font-bold">
              {totalBudget
                ? ((totalSpent / totalBudget) * 100).toFixed(1)
                : "0.0"}
              %
            </p>
          </div>
        </Card>
      </div>

      {/* Charts and Platform Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 📈 Budget vs Spend Trend */}
        <Card>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">
              Budget vs Spend Trend
            </h3>
            <Chart
              data={budgetMonthly}
              xAxis="month"
              series={[
                { accessor: "budget", label: "Budget", type: "bar" },
                { accessor: "spent", label: "Spent", type: "bar" },
              ]}
            />
          </div>
        </Card>

        {/* 🧩 Platform-wise Budget Progress */}
        <Card>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Platform-wise Budget</h3>
            <div className="space-y-4">
              {platformSpend.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  {/* Platform name and values */}
                  <div className="flex justify-between">
                    <span>{platform.platform}</span>
                    <span>
                      ${platform.spent.toLocaleString()} / $
                      {platform.allocated.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (platform.spent / platform.allocated) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
