"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconDotsVertical,
  IconX,
} from "@tabler/icons-react";
import { z } from "zod";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const schema = z.object({
  id: z.number(),
  CampaignName: z.string(),
  Platform: z.string(),
  Impressions: z.string(),
  Clicks: z.string(),
  Conversions: z.string(),
  Spend: z.string(),
  Status: z.string(),
});

type Campaign = z.infer<typeof schema>;

const TableCellViewer = ({ item }: { item: Campaign }) => {
  const [open, setOpen] = React.useState(false);

  const campaignData = React.useMemo(() => {
    const points = 7;
    const random = (val: number) => Math.max(0, val + Math.floor(Math.random() * 30 - 15));
    const impressions = parseInt(item.Impressions);
    const clicks = parseInt(item.Clicks);
    const conversions = parseInt(item.Conversions);
    const spend = parseInt(item.Spend);

    return Array.from({ length: points }).map((_, i) => ({
      day: `Day ${i + 1}`,
      Impressions: random(impressions),
      Clicks: random(clicks),
      Conversions: random(conversions),
      Spend: random(spend),
    }));
  }, [item]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="font-medium text-blue-600 hover:underline">
          {item.CampaignName}
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="flex justify-between items-center border-b pb-2">
          <DrawerTitle>{item.CampaignName} — Insights</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <IconX />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="p-4 grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Platform</Label>
              <Input value={item.Platform} readOnly />
            </div>
            <div>
              <Label>Impressions</Label>
              <Input value={item.Impressions} readOnly />
            </div>
            <div>
              <Label>Clicks</Label>
              <Input value={item.Clicks} readOnly />
            </div>
            <div>
              <Label>Conversions</Label>
              <Input value={item.Conversions} readOnly />
            </div>
            <div>
              <Label>Spend</Label>
              <Input value={item.Spend} readOnly />
            </div>
            <div>
              <Label>Status</Label>
              <Input value={item.Status} readOnly />
            </div>
          </div>

          <div className="mt-6 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={campaignData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Impressions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Clicks"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Conversions"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Spend"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DrawerFooter className="border-t mt-4">
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export function DataTable({
  data,
  onDataChange,
}: {
  data: Campaign[];
  onDataChange?: (newData: Campaign[]) => void;
}) {
  const [dataState, setDataState] = React.useState<Campaign[]>(data);

  const handleDelete = (id: number) => {
    const filtered = dataState.filter((item) => item.id !== id);
    setDataState(filtered);
    if (onDataChange) onDataChange(filtered);
  };

  const columns: ColumnDef<Campaign>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      ),
    },
    {
      accessorKey: "CampaignName",
      header: "Campaign Name",
      cell: ({ row }) => <TableCellViewer item={row.original} />,
    },
    {
      accessorKey: "Platform",
      header: "Platform",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground">
          {row.original.Platform}
        </Badge>
      ),
    },
    { accessorKey: "Impressions", header: "Impressions" },
    { accessorKey: "Clicks", header: "Clicks" },
    { accessorKey: "Conversions", header: "Conversions" },
    { accessorKey: "Spend", header: "Spend" },
    {
      accessorKey: "Status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`px-2 ${
            row.original.Status === "Online"
              ? "text-green-500 border-green-500"
              : "text-yellow-500 border-yellow-500"
          }`}
        >
          {row.original.Status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: dataState,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-muted-foreground"
              >
                No campaigns found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
