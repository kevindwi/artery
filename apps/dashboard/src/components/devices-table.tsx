"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import {
  BulbIcon,
  TemperatureIcon,
  Camera01Icon,
  Plug01Icon,
  HumidityIcon,
  LockKeyIcon,
  KitchenUtensilsIcon,
} from "@hugeicons/core-free-icons";
import { DeviceStatus, type StatusVariant } from "./ui/device-status";

const data: Device[] = [
  {
    device_name: "Sensor Suhu Ruang 1",
    status: "online",
    device_id: "DEV001",
    last_connected: "2025-12-02T10:15:30Z",
    icon: TemperatureIcon,
  },
  {
    device_name: "Kamera IP Lantai 2",
    status: "offline",
    device_id: "DEV002",
    last_connected: "2025-12-01T22:45:10Z",
    icon: Camera01Icon,
  },
  {
    device_name: "Smart Plug Ruang Tamu",
    status: "online",
    device_id: "DEV003",
    last_connected: "2025-12-02T10:20:05Z",
    icon: Plug01Icon,
  },
  {
    device_name: "Sensor Kelembaban Gudang",
    status: "online",
    device_id: "DEV004",
    last_connected: "2025-12-02T10:18:45Z",
    icon: HumidityIcon,
  },
  {
    device_name: "Pintu Pintar Utama",
    status: "offline",
    device_id: "DEV005",
    last_connected: "2025-11-30T14:30:00Z",
    icon: LockKeyIcon,
  },
  {
    device_name: "Lampu Taman Otomatis",
    status: "online",
    device_id: "DEV006",
    last_connected: "2025-12-02T10:10:22Z",
    icon: BulbIcon,
  },
  {
    device_name: "Sensor Asap Dapur",
    status: "offline",
    device_id: "DEV007",
    last_connected: "2025-12-02T08:00:15Z",
    icon: KitchenUtensilsIcon,
  },
  {
    device_name: "AC Cerdas Ruang Kerja",
    status: "online",
    device_id: "DEV008",
    last_connected: "2025-12-02T10:22:30Z",
    icon: TemperatureIcon,
  },
];

export type Device = {
  device_name: string;
  status: string;
  device_id: string;
  last_connected: string;
  icon: IconSvgElement;
};

const columns: ColumnDef<Device>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "device_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 m-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Device ID
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("device_id")}</div>,
  },
  {
    accessorKey: "device_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Device Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex gap-x-2 items-center">
        {/*bg-muted text-foreground*/}
        <div className="bg-secondary text-primary flex aspect-square size-8 items-center justify-center rounded-md">
          <HugeiconsIcon
            icon={row.original.icon}
            size={20}
            color="currentColor"
            strokeWidth={1.5}
          />
        </div>
        {row.getValue("device_name")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as StatusVariant;
      return <DeviceStatus status={status} variant={status} />;
    },
  },
  {
    accessorKey: "last_connected",
    header: ({ column }) => {
      return (
        <div className="w-full flex justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Connected
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const date = formatDateTime(row.getValue("last_connected"));

      return <div className="text-right font-normal">{date}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DeviceTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center pb-4">
        <Input
          placeholder="Filter devices..."
          value={
            (table.getColumn("device_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("device_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
