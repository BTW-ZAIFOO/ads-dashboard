"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSelector } from "./theme-selector";
import { ModeSwitcher } from "./mode-switcher";
import { NavUser } from "./nav-user";
import { IconSearch } from "@tabler/icons-react";
import { NavSecondary } from "./nav-secondary";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  search: {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
};

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">DASHBOARD</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSelector />
          <NavSecondary items={[data.search]} className="mt-auto" />
          <ModeSwitcher />
          <NavUser user={data.user} />
        </div>
      </div>
    </header>
  );
}
