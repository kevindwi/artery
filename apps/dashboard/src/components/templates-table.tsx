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
// import { formatDateTime } from "@/lib/utils";

const data: Template[] = [
  {
    id: "TPL-001",
    name: "Smart Home Automation",
    hardware_platform: "ESP32",
    connection_type: "Wi-Fi",
    description: "Sistem otomasi rumah pintar",
    created_at: "2022-01-01T12:00:00.000Z",
    created_by: [
      {
        id: "OWN-001",
        email: "john.doe@example.com",
        name: "John Doe",
        image: "https://example.com/john-doe.jpg",
      },
    ],
  },
  {
    id: "TPL-002",
    name: "IoT Monitoring Sistem",
    hardware_platform: "Raspberry Pi",
    connection_type: "Ethernet",
    description: "Sistem monitoring IoT untuk industri",
    created_at: "2022-02-01T12:00:00.000Z",
    created_by: [
      {
        id: "OWN-002",
        email: "jane.doe@example.com",
        name: "Jane Doe",
        image: null,
      },
    ],
  },
  {
    id: "TPL-003",
    name: "Smart City",
    hardware_platform: "Arduino",
    connection_type: "LoRaWAN",
    description: "Sistem smart city untuk kota pintar",
    created_at: "2022-03-01T12:00:00.000Z",
    created_by: [
      {
        id: "OWN-001",
        email: "john.doe@example.com",
        name: "John Doe",
        image: "https://example.com/john-doe.jpg",
      },
      {
        id: "OWN-003",
        email: "bob.smith@example.com",
        name: "Bob Smith",
        image: "https://example.com/bob-smith.jpg",
      },
    ],
  },
  {
    id: "TPL-004",
    name: "Industrial Automation",
    hardware_platform: "PLC",
    connection_type: "Modbus",
    description: "Sistem otomasi industri",
    created_at: "2022-04-01T12:00:00.000Z",
    created_by: [
      {
        id: "OWN-002",
        email: "jane.doe@example.com",
        name: "Jane Doe",
        image: null,
      },
    ],
  },
  {
    id: "TPL-005",
    name: "Smart Agriculture",
    hardware_platform: "ESP8266",
    connection_type: "Wi-Fi",
    description: "Sistem smart agriculture untuk pertanian pintar",
    created_at: "2022-05-01T12:00:00.000Z",
    created_by: [
      {
        id: "OWN-003",
        email: "bob.smith@example.com",
        name: "Bob Smith",
        image: "https://example.com/bob-smith.jpg",
      },
    ],
  },
];

type Owner = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type Template = {
  id: string;
  name: string;
  hardware_platform: string;
  connection_type: string;
  description: string;
  created_at: string;
  created_by: Owner[];
};

interface TemplatesTableProps {
  data: Template[];
}

const columns: ColumnDef<Template>[] = [
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
    accessorKey: "id",
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
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
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
      <div className="flex gap-x-2 items-center">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "hardware_platform",
    header: "Hardware Platform",
    cell: ({ row }) => (
      <div className="flex gap-x-2 items-center">
        {row.getValue("hardware_platform")}
      </div>
    ),
  },
  {
    accessorKey: "connection_type",
    header: "Connection Type",
    cell: ({ row }) => (
      <div className="flex gap-x-2 items-center">
        {row.getValue("connection_type")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="flex gap-x-2 items-center">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created at",
    cell: ({ row }) => (
      <div className="flex gap-x-2 items-center">{row.getValue("created_at")}</div>
    ),
  },
  {
    accessorKey: "created_by",
    header: "Created by",
    cell: ({ row }) => {
      const owners = row.getValue("created_by") as Owner[];
      return (
        <div className="flex flex-col gap-1">
          {owners.map((owner) => (
            <span key={owner.id} className="text-sm">
              {owner.name}
            </span>
          ))}
        </div>
      );
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

export function TemplatesTable({ data = [] }: TemplatesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    {},
  );
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
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
