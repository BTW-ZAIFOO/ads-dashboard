"use client";

import * as React from "react";
import type { ChartConfig } from "./chart-area-interactive";

interface ChartContainerProps {
  children: React.ReactNode;
  config: ChartConfig;
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  return (
    <div
      className="relative aspect-2/1 w-full text-primary"
      style={
        {
          ["--color-desktop" as any]: config?.desktop?.color ?? "#2563eb",
          ["--color-mobile" as any]: config?.mobile?.color ?? "#16a34a",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
