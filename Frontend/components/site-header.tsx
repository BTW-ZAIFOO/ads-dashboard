"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSelector } from "./theme-selector";
import { ModeSwitcher } from "./mode-switcher";
import { NavUser } from "./nav-user";
import { IconSearch } from "@tabler/icons-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

const data = {
  user: {
    name: "OMNELYTIX",
    email: "info@omnelytix.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const searchData = [
    { name: "Dashboard", href: "/" },
    { name: "Campaigns", href: "/campaigns" },
    { name: "Reports", href: "/reports" },
    { name: "Analytics", href: "/analytics" },
    { name: "Settings", href: "/settings" },
    { name: "Users", href: "/users" },
  ];

  const results = searchData.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
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

            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-md border px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              <IconSearch className="size-4" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="ml-2 hidden rounded border bg-muted px-1.5 text-xs sm:inline whitespace-nowrap">
                Ctrl K
              </kbd>
            </button>

            <ModeSwitcher />
            <div className="pb-1">
            <NavUser user={data.user} />
            </div>
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search anywhere in Omnelytix..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {results.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
              >
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
