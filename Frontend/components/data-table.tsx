"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  IconDotsVertical,
  IconGripVertical,
  IconX,
} from "@tabler/icons-react"
import { z } from "zod"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"

export const schema = z.object({
  id: z.number(),
  CampaignName: z.string(),
  Platform: z.string(),
  Impressions: z.string(),
  Clicks: z.string(),
  Conversions: z.string(),
  Spend: z.string(),
  Status: z.string(),
})

type Campaign = z.infer<typeof schema>

const DragHandle = ({ id }: { id: number }) => (
  <div className="cursor-grab p-2 text-muted-foreground hover:text-primary">
    <IconGripVertical size={16} />
  </div>
)

const TableCellViewer = ({ item }: { item: Campaign }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="font-medium text-blue-600 hover:underline">
          {item.CampaignName}
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex justify-between items-center border-b pb-2">
          <DrawerTitle>{item.CampaignName}</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <IconX />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="p-4 grid gap-4">
          <div className="grid gap-2">
            <Label>Platform</Label>
            <Input value={item.Platform} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Impressions</Label>
            <Input value={item.Impressions} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Clicks</Label>
            <Input value={item.Clicks} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Conversions</Label>
            <Input value={item.Conversions} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Spend</Label>
            <Input value={item.Spend} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Input value={item.Status} readOnly />
          </div>
        </div>

        <DrawerFooter className="border-t mt-4">
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const columns: ColumnDef<Campaign>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
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
    enableSorting: false,
    enableHiding: false,
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
  {
    accessorKey: "Impressions",
    header: "Impressions",
    cell: ({ row }) => (
      <div>{row.original.Impressions}</div>
    ),
  },
  {
    accessorKey: "Clicks",
    header: "Clicks",
    cell: ({ row }) => (
      <div>{row.original.Clicks}</div>
    ),
  },
  {
    accessorKey: "Conversions",
    header: "Conversions",
    cell: ({ row }) => (
      <div>{row.original.Conversions}</div>
    ),
  },
  {
    accessorKey: "Spend",
    header: "Spend",
    cell: ({ row }) => (
      <div>{row.original.Spend}</div>
    ),
  },
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
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function DataTable({ data }: { data: Campaign[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
  )
}

