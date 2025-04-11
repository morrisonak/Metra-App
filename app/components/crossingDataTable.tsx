import * as React from "react";
import { Link } from "react-router";
import {
  ArrowUpDown,
  CheckCircle,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Clock,
  ColumnsIcon,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from "~/components/ui/sheet";

// Define the schema for crossing data with Zod
export const crossingSchema = z.object({
  crossing_id: z.string(),
  street: z.string().nullable(),
  highway_name: z.string().nullable(),
  city_name: z.string().nullable(),
  state_name: z.string().nullable(),
  crossing_type: z.string().nullable(),
  wd_code: z.string().nullable(),
  revision_date: z.string().nullable().or(z.date()),
  report_status: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  railroad_name: z.string().nullable(),
  railroad_subdivision: z.string().nullable(),
  railroad_division: z.string().nullable(),
  railroad_milepost_number: z.string().nullable(),
  total_daylight_thru_trains: z.number().nullable(),
  total_nighttime_thru_trains: z.number().nullable(),
  number_of_main_tracks: z.number().nullable(),
  maximum_timetable_speed: z.number().nullable(),
});

// Type for our data
export type Crossing = z.infer<typeof crossingSchema>;

// Helper functions for formatting crossing data
const getCrossingType = (type: string | null) => {
  if (!type) return "Unknown";

  const typeLower = type.toLowerCase();
  if (typeLower.includes("public")) return "Public";
  if (typeLower.includes("private")) return "Private";
  if (typeLower.includes("pedestrian")) return "Pedestrian";
  return type;
};

const getWarningDevice = (device: string | null) => {
  if (!device) return "Unknown";

  const deviceCode = (device || "").toUpperCase();
  // Map warning device codes to display names
  const deviceMap: Record<string, string> = {
    GATES: "Gates",
    FLASH: "Flashers",
    CANTT: "Cantilevers",
    XBUCK: "Crossbucks",
    STOP: "Stop Signs",
    PASSV: "Passive",
    NONE: "None",
  };

  // Try to match the code with our map
  for (const [code, name] of Object.entries(deviceMap)) {
    if (deviceCode.includes(code)) return name;
  }

  return device;
};

const getCrossingStatus = (status: string | null) => {
  if (!status) return "Pending Review";

  const statusLower = (status || "").toLowerCase();
  if (statusLower === "active" || statusLower === "completed")
    return "Compliant";
  if (statusLower === "inactive" || statusLower === "failed")
    return "Non-Compliant";
  return "Pending Review";
};

const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "Unknown";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return "Invalid Date";
  }
};

interface RailroadCrossingsTableProps {
  data: Crossing[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export function RailroadCrossingsTable({
  data,
  pagination,
}: RailroadCrossingsTableProps) {
  // State for table functionality
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // State for local pagination when server pagination isn't provided
  const [tablePagination, setTablePagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Define table columns
  const columns: ColumnDef<Crossing>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "crossing_id",
      header: "DOT Number", // Simple header without sort button
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            <Link to={`/crossings/${row.original.crossing_id}`}>
              {row.original.crossing_id}
            </Link>
          </div>
        );
      },
      enableSorting: false, 
    },
    {
      // Use an accessorFn to transform the value for sorting purposes
      accessorFn: (row) => {
        const milepost = row.railroad_milepost_number;
        if (!milepost) return 0; // For sorting purposes, treat unknown as 0

        // Parse as numeric value for correct sorting
        const numericValue = parseFloat(milepost);
        return isNaN(numericValue) ? 0 : numericValue;
      },
      id: "railroad_milepost_number",
      header: ({ column }) => (
        <div className="flex items-center">
          Milepost
          <Button
            variant="ghost"
            size="sm"
            className="-ml-1 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const milepost = row.original.railroad_milepost_number;
        if (!milepost) return "Unknown";

        // Remove leading zeros while keeping the full number intact
        const formattedMilepost = milepost.replace(/^0+(\d+\.\d+)$/, "$1");

        return <div>{formattedMilepost}</div>;
      },
    },
    {
      accessorKey: "railroad_subdivision",
      header: "Subdivision",
      cell: ({ row }) => (
        <div>{row.original.railroad_subdivision || "Unknown"}</div>
      ),
    },
    {
        accessorFn: (row) => row.street || row.highway_name || "Unnamed Crossing",
        id: "Street",
        header: "Street",
        cell: ({ row }) => {
          const streetName = row.original.street || row.original.highway_name || "Unnamed Crossing";
          
          return (
            <div className="max-w-[200px]"> {/* Set a maximum width */}
              <Sheet>
                <Button
                  variant="link"
                  className="px-0 text-left text-foreground truncate w-full" /* Add truncate class */
                  asChild
                  title={streetName} /* Add title for hover tooltip */
                >
                  <Link to={`/crossings/${row.original.crossing_id}`}>
                    {streetName}
                  </Link>
                </Button>
              </Sheet>
            </div>
          );
        },
      },
    {
      accessorFn: (row) =>
        `${row.city_name || "Unknown"}, ${row.state_name || "Unknown"}`,
      id: "city",
      header: "City",
      cell: ({ row }) => (
        <div>
          {row.original.city_name || "Unknown"},{" "}
          {row.original.state_name || "Unknown"}
        </div>
      ),
    },
    // {
    //   accessorFn: (row) => getCrossingType(row.crossing_type),
    //   id: "type",
    //   header: "Type",
    //   cell: ({ row }) => (
    //     <div>
    //       <Badge variant="outline">
    //         {getCrossingType(row.original.crossing_type)}
    //       </Badge>
    //     </div>
    //   ),
    // },
    // {
    //   accessorFn: (row) => getWarningDevice(row.wd_code),
    //   id: "warningDevice",
    //   header: "Warning Device",
    //   cell: ({ row }) => (
    //     <div>
    //       {getWarningDevice(row.original.wd_code)}
    //     </div>
    //   ),
    // },

    {
      accessorFn: (row) => formatDate(row.revision_date),
      id: "lastUpdated",
      header: ({ column }) => (
        <div className="flex items-center">
          Last Updated
          <Button
            variant="ghost"
            size="sm"
            className="-ml-1 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div>{formatDate(row.original.revision_date)}</div>,
    },
    // {
    //   accessorFn: (row) => getCrossingStatus(row.report_status),
    //   id: "status",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     const status = getCrossingStatus(row.original.report_status);
    //     return (
    //       <Badge
    //         variant={
    //           status === "Compliant"
    //             ? "default"
    //             : status === "Non-Compliant"
    //               ? "destructive"
    //               : "outline"
    //         }
    //         className="flex w-fit items-center gap-1"
    //       >
    //         {status === "Compliant" ? (
    //           <CheckCircle className="h-3 w-3" />
    //         ) : status === "Non-Compliant" ? (
    //           <XCircle className="h-3 w-3" />
    //         ) : (
    //           <Clock className="h-3 w-3" />
    //         )}
    //         {status}
    //       </Badge>
    //     );
    //   },
    // },
    // {
    //   id: "actions",
    //   header: () => <div className="text-right">Actions</div>,
    //   cell: ({ row }) => (
    //     <div className="text-right">
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" size="icon">
    //             <MoreHorizontal className="h-4 w-4" />
    //             <span className="sr-only">Open menu</span>
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem asChild>
    //             <Link to={`/crossings/${row.original.crossing_id}`}>
    //               <Eye className="mr-2 h-4 w-4" />
    //               View Details
    //             </Link>
    //           </DropdownMenuItem>
    //           <DropdownMenuItem asChild>
    //             <Link to={`/crossings/${row.original.crossing_id}/edit`}>
    //               <Edit className="mr-2 h-4 w-4" />
    //               Edit
    //             </Link>
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     </div>
    //   ),
    // },
  ];

  // Filter the table data based on search input and filters
  const filteredData = React.useMemo(() => {
    return data.filter((crossing) => {
      // Check if crossing matches search term
      const matchesSearch =
        searchTerm === "" ||
        crossing.crossing_id
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (crossing.street?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (crossing.highway_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (crossing.city_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (crossing.state_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      // Check if crossing matches type filter
      const type = getCrossingType(crossing.crossing_type);
      const matchesType = typeFilter === "all" || type === typeFilter;

      // Check if crossing matches status filter
      const status = getCrossingStatus(crossing.report_status);
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [data, searchTerm, typeFilter, statusFilter]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: pagination
        ? { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }
        : tablePagination,
    },
    enableRowSelection: true,
    manualPagination: !!pagination, // Use manual pagination if server pagination is provided
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: pagination ? undefined : setTablePagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount:
      pagination?.pageCount ||
      Math.ceil(filteredData.length / tablePagination.pageSize),
  });

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    table.resetColumnFilters();
  };

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crossings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Crossing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Public">Public</SelectItem>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Pedestrian">Pedestrian</SelectItem>
          </SelectContent>
        </Select> */}

        {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Compliant">Compliant</SelectItem>
            <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
            <SelectItem value="Pending Review">Pending Review</SelectItem>
          </SelectContent>
        </Select> */}

        {/* <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button> */}

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon className="mr-1 h-4 w-4" />
                Columns
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                        cell.getContext()
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
                  No crossings found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                const size = Number(value);
                if (pagination) {
                  pagination.onPageSizeChange(size);
                } else {
                  table.setPageSize(size);
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                if (pagination) {
                  pagination.onPageChange(0);
                } else {
                  table.setPageIndex(0);
                }
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (pagination) {
                  pagination.onPageChange(
                    table.getState().pagination.pageIndex - 1
                  );
                } else {
                  table.previousPage();
                }
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (pagination) {
                  pagination.onPageChange(
                    table.getState().pagination.pageIndex + 1
                  );
                } else {
                  table.nextPage();
                }
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                if (pagination) {
                  pagination.onPageChange(table.getPageCount() - 1);
                } else {
                  table.setPageIndex(table.getPageCount() - 1);
                }
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
