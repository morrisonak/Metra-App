import { Link } from "react-router";
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

// Mock data for the table
const crossings = [
  {
    id: "123456",
    name: "Main Street Crossing",
    city: "Chicago",
    state: "IL",
    type: "Public",
    warningDevice: "Gates",
    lastUpdated: "2023-12-15",
    status: "Compliant",
  },
  {
    id: "789012",
    name: "Oak Avenue Crossing",
    city: "Evanston",
    state: "IL",
    type: "Public",
    warningDevice: "Flashers",
    lastUpdated: "2023-11-20",
    status: "Pending Review",
  },
  {
    id: "345678",
    name: "Industrial Park Access",
    city: "Joliet",
    state: "IL",
    type: "Private",
    warningDevice: "Passive",
    lastUpdated: "2023-10-05",
    status: "Non-Compliant",
  },
  {
    id: "901234",
    name: "River Road Crossing",
    city: "Naperville",
    state: "IL",
    type: "Public",
    warningDevice: "Gates",
    lastUpdated: "2024-01-10",
    status: "Compliant",
  },
  {
    id: "567890",
    name: "County Line Road",
    city: "Aurora",
    state: "IL",
    type: "Public",
    warningDevice: "Flashers",
    lastUpdated: "2023-09-18",
    status: "Compliant",
  },
  {
    id: "234567",
    name: "Farm Access Road",
    city: "Elgin",
    state: "IL",
    type: "Private",
    warningDevice: "Passive",
    lastUpdated: "2023-08-22",
    status: "Pending Review",
  },
  {
    id: "890123",
    name: "Park District Path",
    city: "Chicago",
    state: "IL",
    type: "Pedestrian",
    warningDevice: "Flashers",
    lastUpdated: "2023-12-01",
    status: "Compliant",
  },
];

export default function CrossingsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter crossings based on search term and filters
  const filteredCrossings = crossings.filter((crossing) => {
    const matchesSearch =
      crossing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crossing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crossing.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || crossing.type === typeFilter;
    const matchesStatus = statusFilter === "all" || crossing.status === statusFilter;

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
            Add New Crossing
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
                <TableHead className="w-[100px]">ID</TableHead>
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
              {filteredCrossings.map((crossing) => (
                <TableRow key={crossing.id}>
                  <TableCell className="font-medium">{crossing.id}</TableCell>
                  <TableCell>{crossing.name}</TableCell>
                  <TableCell>
                    {crossing.city}, {crossing.state}
                  </TableCell>
                  <TableCell>{crossing.type}</TableCell>
                  <TableCell>{crossing.warningDevice}</TableCell>
                  <TableCell>{crossing.lastUpdated}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        crossing.status === "Compliant"
                          ? "default"
                          : crossing.status === "Non-Compliant"
                            ? "destructive"
                            : "outline"
                      }
                      className="flex w-fit items-center gap-1"
                    >
                      {crossing.status === "Compliant" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : crossing.status === "Non-Compliant" ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {crossing.status}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}