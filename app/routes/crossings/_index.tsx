import { Link, useLoaderData } from "react-router";
import { ArrowUpDown, CheckCircle, Clock, Edit, Eye, MapPin, MoreHorizontal, Plus, Trash, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "~/components/ui/dropdown-menu";
import { useState } from "react";
import { db } from "~/lib/db";
import { railroadCrossings } from "~/db/schema";
import { asc, desc, eq, ilike, or } from "drizzle-orm";

// Loader function to fetch crossing data
export async function loader() {
  try {
    // Fetch all crossings from the database
    const crossings = await db.select({
      id: railroadCrossings.crossing_id,
      name: railroadCrossings.street,
      city: railroadCrossings.city_name,
      state: railroadCrossings.state_name,
      type: railroadCrossings.crossing_type,
      warningDevice: railroadCrossings.wd_code,
      lastUpdated: railroadCrossings.revision_date,
      status: railroadCrossings.report_status
    })
    .from(railroadCrossings)
    .orderBy(desc(railroadCrossings.revision_date))
    .limit(50);

    return { 
      crossings, 
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching crossings:', error);
    return { 
      crossings: [], 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper function to determine crossing status display
const getCrossingStatus = (status: string | null) => {
  if (!status) return "Pending Review";
  
  const statusLower = status.toLowerCase();
  if (statusLower === "active" || statusLower === "completed") return "Compliant";
  if (statusLower === "inactive" || statusLower === "failed") return "Non-Compliant";
  return "Pending Review";
};

// Helper function to determine crossing type display
const getCrossingType = (type: string | null) => {
  if (!type) return "Unknown";
  
  const typeLower = type.toLowerCase();
  if (typeLower.includes("public")) return "Public";
  if (typeLower.includes("private")) return "Private";
  if (typeLower.includes("pedestrian")) return "Pedestrian";
  return type;
};

// Helper function to determine warning device display
const getWarningDevice = (device: string | null) => {
  if (!device) return "Unknown";
  
  const deviceCode = device.toUpperCase();
  // Map warning device codes to display names
  const deviceMap: Record<string, string> = {
    "GATES": "Gates",
    "FLASH": "Flashers",
    "CANTT": "Cantilevers",
    "XBUCK": "Crossbucks",
    "STOP": "Stop Signs",
    "PASSV": "Passive",
    "NONE": "None"
  };
  
  // Try to match the code with our map
  for (const [code, name] of Object.entries(deviceMap)) {
    if (deviceCode.includes(code)) return name;
  }
  
  return device;
};

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Unknown";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return "Invalid Date";
  }
};

export default function CrossingsListPage() {
  const { crossings, success, error } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // If loading failed, show error
  if (!success) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <h2 className="text-lg font-bold">Error Loading Crossings</h2>
          <p>{error || "An unknown error occurred while loading crossing data."}</p>
        </div>
      </div>
    );
  }

  // Filter crossings based on search term and filters
  const filteredCrossings = crossings.filter((crossing) => {
    const matchesSearch = 
      (crossing.id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (crossing.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (crossing.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const crossingType = getCrossingType(crossing.type);
    const crossingStatus = getCrossingStatus(crossing.status);
    
    const matchesType = typeFilter === "all" || crossingType === typeFilter;
    const matchesStatus = statusFilter === "all" || crossingStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crossings</h2>
          <p className="text-muted-foreground">Manage Railroad crossing inventory data</p>
        </div>
        <Button asChild>
          <Link to="/crossings/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Inspection
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search crossings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Crossing Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Pedestrian">Pedestrian</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Compliant">Compliant</SelectItem>
              <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
              <SelectItem value="Pending Review">Pending Review</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}
          >
            Reset
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">DOT</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Warning Device</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Last Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCrossings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No crossings found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCrossings.map((crossing) => {
                  const status = getCrossingStatus(crossing.status);
                  const type = getCrossingType(crossing.type);
                  const warningDevice = getWarningDevice(crossing.warningDevice);
                  
                  return (
                    <TableRow key={crossing.id}>
                      <TableCell className="font-medium"> <Link to={`/crossings/${crossing.id}`}>{crossing.id}</Link></TableCell>
                      <TableCell>{crossing.name || "Unnamed Crossing"}</TableCell>
                      <TableCell>
                        {crossing.city || "Unknown"}, {crossing.state || "Unknown"}
                      </TableCell>
                      <TableCell>{type}</TableCell>
                      <TableCell>{warningDevice}</TableCell>
                      <TableCell>{formatDate(crossing.lastUpdated)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "Compliant"
                              ? "default"
                              : status === "Non-Compliant"
                                ? "destructive"
                                : "outline"
                          }
                          className="flex w-fit items-center gap-1"
                        >
                          {status === "Compliant" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : status === "Non-Compliant" ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/crossings/${crossing.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/crossings/${crossing.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}