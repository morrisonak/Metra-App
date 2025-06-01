import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  CalendarIcon,
  Save,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Zap,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { z } from "zod"

import { useIsMobile } from "~/hooks/use-mobile"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart"
import { Checkbox } from "~/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Link } from "react-router"

// Schema for inspection data
export const inspectionSchema = z.object({
  id: z.number(),
  crossing_id: z.string(),
  crossing_name: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  inspection_date: z.string(),
  staff_type: z.string(),
  inspector_name: z.string(),
  status: z.string(),
  priority: z.string(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof inspectionSchema>>[] = [
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
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    header: "DOT Number",
    cell: ({ row }) => {
      return <InspectionViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "crossing_name",
    header: "Crossing Name",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <span className="font-medium">
          {row.original.crossing_name || "Unnamed Crossing"}
        </span>
        <div className="text-xs text-muted-foreground">
          {row.original.city}, {row.original.state}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "inspection_date",
    header: "Inspection Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span>{new Date(row.original.inspection_date).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    accessorKey: "staff_type",
    header: "Staff Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.staff_type}
      </Badge>
    ),
  },
  {
    accessorKey: "inspector_name",
    header: "Inspector",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.inspector_name}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge 
          variant={status === "Completed" ? "default" : status === "In Progress" ? "secondary" : "outline"}
          className="flex gap-1 px-1.5 [&_svg]:size-3"
        >
          {status === "Completed" ? (
            <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
          ) : (
            <ClockIcon />
          )}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority;
      return (
        <Badge 
          variant={priority === "High" ? "destructive" : priority === "Medium" ? "secondary" : "outline"}
        >
          {priority}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
            <span className="sr-only">Open menu</span>
            ⋯
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit Inspection</DropdownMenuItem>
          <DropdownMenuItem>Mark Complete</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof inspectionSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  )
}

export function InspectionDataTable({
  data: initialData,
}: {
  data: z.infer<typeof inspectionSchema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs defaultValue="recent" className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="recent">
          <SelectTrigger className="@4xl/main:hidden flex w-fit" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent Inspections</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden">
          <TabsTrigger value="recent">Recent Inspections</TabsTrigger>
          <TabsTrigger value="pending" className="gap-1">
            Pending Review{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              {data.filter(item => item.status === "Pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            Completed{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              {data.filter(item => item.status === "Completed").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <PlusIcon />
            <span className="hidden lg:inline">New Inspection</span>
          </Button>
        </div>
      </div>

      <TabsContent value="recent" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No inspections found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} inspection(s)
            selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="pending" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ClockIcon className="mx-auto h-8 w-8 mb-2" />
            <p>Pending inspections view</p>
            <p className="text-sm">Show inspections awaiting review</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="completed" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <CheckCircle2Icon className="mx-auto h-8 w-8 mb-2" />
            <p>Completed inspections view</p>
            <p className="text-sm">Show completed inspections with metrics</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPinIcon className="mx-auto h-8 w-8 mb-2" />
            <p>Inspection analytics</p>
            <p className="text-sm">Performance metrics and trends</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

// Chart data for inspection trends
const inspectionChartData = [
  { month: "January", management: 18, represented: 42 },
  { month: "February", management: 22, represented: 38 },
  { month: "March", management: 19, represented: 45 },
  { month: "April", management: 25, represented: 52 },
  { month: "May", management: 23, represented: 48 },
  { month: "June", management: 21, represented: 44 },
]

const chartConfig = {
  management: {
    label: "Management",
    color: "hsl(var(--chart-1))",
  },
  represented: {
    label: "Represented",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function InspectionViewer({ item }: { item: z.infer<typeof inspectionSchema> }) {
  const isMobile = useIsMobile()

  return (
<Sheet>
  <SheetTrigger asChild>
    <Button 
      variant="link" 
      className="justify-start px-0 h-auto font-mono text-left text-foreground hover:text-primary transition-colors"
    >
      {item.crossing_id}
    </Button>
  </SheetTrigger>
  <SheetContent 
    side="right" 
    className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
  >
    <SheetHeader className="px-6 py-4 border-b bg-muted/30">
      <SheetTitle className="text-lg">Inspection Details</SheetTitle>
      <SheetDescription className="text-sm text-muted-foreground">
        {item.crossing_name || "Unnamed Crossing"} • <span className="font-mono">{item.crossing_id}</span>
      </SheetDescription>
    </SheetHeader>
    
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="space-y-6">
        {/* Crossing Information Card */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Crossing Information</Label>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <div className="text-muted-foreground">DOT Number:</div>
            <div className="font-mono font-medium">{item.crossing_id}</div>
            <div className="text-muted-foreground">Location:</div>
            <div className="font-medium">{item.city}, {item.state}</div>
            <div className="text-muted-foreground">Name:</div>
            <div className="font-medium">{item.crossing_name || "Unnamed Crossing"}</div>
          </div>
        </div>
        
        {/* Inspection Details Card */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Inspection Details</Label>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <div className="text-muted-foreground">Date:</div>
            <div className="font-medium">
              {new Date(item.inspection_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-muted-foreground">Inspector:</div>
            <div className="font-medium">{item.inspector_name}</div>
            <div className="text-muted-foreground">Staff Type:</div>
            <div className="font-medium capitalize">{item.staff_type}</div>
            <div className="text-muted-foreground">Status:</div>
            <div>
              <Badge 
                variant={
                  item.status === 'Completed' ? 'default' : 
                  item.status === 'In Progress' ? 'secondary' : 
                  'outline'
                }
                className="text-xs"
              >
                {item.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                {item.status === 'In Progress' && <Clock className="w-3 h-3 mr-1" />}
                {item.status}
              </Badge>
            </div>
            <div className="text-muted-foreground">Priority:</div>
            <div>
              <Badge 
                variant={
                  item.priority === 'High' ? 'destructive' : 
                  item.priority === 'Medium' ? 'secondary' : 
                  'outline'
                }
                className="text-xs"
              >
                {item.priority}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Quick Actions</Label>
          </div> <div className="grid grid-cols-1 gap-2">
            <Button size="sm" variant="outline" className="justify-start">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Follow-up
            </Button>
            <Button size="sm" variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Add Notes
            </Button>
           <Button size="sm" variant="outline" className="justify-start" asChild>
              <Link to={`/crossings/${item.crossing_id}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Details
              </Link>
            </Button>
          </div>
         
        </div>
      </div>
    </div>
    
    <SheetFooter className="border-t bg-muted/30 px-6 py-4 mt-auto">
      <div className="flex flex-col gap-2 w-full sm:flex-row">
        <Button className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Update Inspection
        </Button>
        <SheetClose asChild>
          <Button variant="outline" className="flex-1">
            Close
          </Button>
        </SheetClose>
      </div>
    </SheetFooter>
  </SheetContent>
</Sheet>
  )
}