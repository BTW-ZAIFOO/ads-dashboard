"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SectionCards } from "@/components/section-cards"

function detectPlatform(campaignName: string) {
  if (campaignName.toLowerCase().includes("meta")) return "Meta"
  if (campaignName.toLowerCase().includes("google")) return "Google"
  if (campaignName.toLowerCase().includes("facebook")) return "Facebook"
  if (campaignName.toLowerCase().includes("tiktok")) return "TikTok"
  if (campaignName.toLowerCase().includes("youtube")) return "YouTube"
  return "Other"
}

type TableRow = {
  id: number
  CampaignName: string
  Platform: string
  Impressions: string
  Clicks: string
  Conversions: string
  Spend: string
  Status: string
}

export default function Page() {
  const [rows, setRows] = React.useState<TableRow[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
        const url = base ? `${base.replace(/\/$/, "")}/ads?limit=500` : "/api/ads?limit=500"
        const res = await fetch(url, { cache: "no-store" })
        const json = await res.json()
        const data = (json.data || []) as Array<{
          id: number
          campaign_name: string
          impressions: number
          clicks: number
          conversions: number
          runrate: number
        }>
        const mapped = data.map((item, index) => ({
          id: item.id ?? index + 1,
          CampaignName: item.campaign_name,
          Platform: detectPlatform(item.campaign_name),
          Impressions: String(item.impressions),
          Clicks: String(item.clicks),
          Conversions: String(item.conversions),
          Spend: `$${(item.runrate * 10).toFixed(2)}`,
          Status: item.runrate > 55 ? "Active" : "Paused",
        }))
        setRows(mapped)
      } catch (e) {
        setRows([])
      }
    }
    load()
  }, [])
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <SectionCards />
                <ChartAreaInteractive />
              </div>
              <div className="px-4 lg:px-6">
                <DataTable data={rows} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
