import { useState } from "react";
import { useFetcher } from "react-router";
import {
  Download,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// FRA API Constants
const FRA_API_BASE_URL =
  "https://safetydata.fra.dot.gov/MasterWebService/PublicApi/GCIS/v1/odata";
const FRA_API_TOKEN = import.meta.env.VITE_FRA_API_TOKEN || "";

// Types for API responses
type Crossing = {
  CrossingId: string;
  OperatingRailroadCode: string;
  OperatingRailroadName: string;
  TypeXing: string;
  PositionCd: string;
  NearestCityTown: string;
  Nearest: string;
  StateCD: string;
  StateNm: string;
  CountyCd: string;
  CountyNm: string;
  Highway: string;
  Street: string;
  Latitude: string;
  Longitude: string;
  CrossingClosed: string;
  RrDiv: string;
  RrSubDiv: string;
  Branch: string;
  MilePost: string;
  DayThru: string;
  NghtThru: number;
  MaxTtSpd: string;
  MainTrk: string;
  SidingTrk: string;
  YardTrk: string;
  Aadt: string;
  AadtYear: string;
  HwySpeed: string;
  XSurfWidth: string;
  XSurfLength: string;
  Gates: string;
  FlashOv: string;
  FlashNov: string;
  XBuck: string;
  StopStd: string;
  YieldStd: string;
  Bells: string;
  RrCont: string;
  HwyCont: string;
  PolCont: string;
  RevisionDate: string;
  LastUpdateDt: string;
};

// Query types
type QueryType =
  | "crossing"
  | "railroad"
  | "state"
  | "public"
  | "private"
  | "county";

type QueryParams = {
  queryType: QueryType;
  queryParam: string;
  skipCount: number;
  pageSize: number;
};

// Helper function to build the query URL based on the query type and parameter
const buildQueryUrl = (
  type: QueryType,
  param: string,
  skip: number,
  take: number
): string => {
  let filterParam = "";

  switch (type) {
    case "crossing":
      filterParam = `$filter=CrossingId eq '${param}'`;
      break;
    case "railroad":
      filterParam = `$filter=OperatingRailroadCode eq '${param}'`;
      break;
    case "state":
      filterParam = `$filter=StateCD eq '${param}'`;
      break;
    case "public":
      filterParam = `$filter=TypeXing eq '3'`;
      break;
    case "private":
      filterParam = `$filter=TypeXing eq '2'`;
      break;
    case "county":
      filterParam = `$filter=CountyNm eq '${param}'`;
      break;
    default:
      break;
  }

  return `${FRA_API_BASE_URL}/Crossings?${filterParam}&$format=json&token=${FRA_API_TOKEN}${
    skip > 0 ? `&$skip=${skip}` : ""
  }${take > 0 ? `&$top=${take}` : ""}`;
};

// Fetch the FRA API data
const fetchFraData = async (params: QueryParams) => {
  const { queryType, queryParam, skipCount, pageSize } = params;

  // Build the API URL
  const apiUrl = buildQueryUrl(queryType, queryParam, skipCount, pageSize);

  // Make the server-side request to FRA API
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  // Parse the response
  const data = await response.json();
  console.log("FRA API data:", data);

  return {
    data,
    totalCount: skipCount + data.value.length,
    hasMoreResults: data.value.length === pageSize,
  };
};

// Initial loader function - loads default railroad (METX) data
export async function loader({ request }) {
  try {
    // Default to METX railroad on initial load
    const initialParams: QueryParams = {
      queryType: "railroad",
      queryParam: "METX",
      skipCount: 0,
      pageSize: 10,
    };

    const result = await fetchFraData(initialParams);

    return {
      success: true,
      ...result,
      initialParams,
    };
  } catch (error) {
    console.error("FRA API error:", error);
    return {
      success: false,
      error: `Failed to fetch data: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Action function - handles form submissions for queries
export async function action({ request }) {
  try {
    // Get the request data
    const formData = await request.formData();

    const params: QueryParams = {
      queryType: formData.get("queryType") as QueryType,
      queryParam: (formData.get("queryParam") as string) || "",
      skipCount: parseInt(formData.get("skipCount") as string) || 0,
      pageSize: parseInt(formData.get("pageSize") as string) || 10,
    };

    const result = await fetchFraData(params);

    // Return the data
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("FRA API error:", error);
    return {
      success: false,
      error: `Failed to fetch data: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export default function FraQueryPage() {
  const fetcher = useFetcher();
  const [queryType, setQueryType] = useState<QueryType>("railroad");
  const [queryParam, setQueryParam] = useState<string>("METX");
  const [pageSize, setPageSize] = useState<number>(10);
  const [skipCount, setSkipCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(false);
  const [selectedCrossing, setSelectedCrossing] = useState<Crossing | null>(
    null
  );

  // Extract data from loaderData or actionData
  const isLoading = fetcher.state !== "idle";

  // Data can come from either initial loader or subsequent actions
  const resultData: Crossing[] = fetcher.data?.success
    ? fetcher.data.data?.value || []
    : [];

  const error = fetcher.data?.success === false ? fetcher.data.error : null;

  // Calculate loading progress based on fetcher state
  const loadingProgress = isLoading
    ? fetcher.state === "submitting"
      ? 30
      : 70
    : 0;

  // Function to handle query submission
  const handleSubmitQuery = () => {
    setSkipCount(0);
    setSelectedCrossing(null);
    submitFetcherRequest();
  };

  // Submit the form data
  const submitFetcherRequest = () => {
    const formData = new FormData();
    formData.append("queryType", queryType);
    formData.append("queryParam", queryParam);
    formData.append("skipCount", skipCount.toString());
    formData.append("pageSize", pageSize.toString());

    fetcher.submit(formData, { method: "post" });
  };

  // Update state when we get successful results
  if (fetcher.data?.success && fetcher.state === "idle") {
    if (fetcher.data.totalCount > totalCount) {
      setTotalCount(fetcher.data.totalCount);
    }
    if (hasMoreResults !== fetcher.data.hasMoreResults) {
      setHasMoreResults(fetcher.data.hasMoreResults);
    }
  }

  // Function to handle pagination
  const handleNextPage = () => {
    const newSkipCount = skipCount + pageSize;
    setSkipCount(newSkipCount);
    setSelectedCrossing(null);

    setTimeout(() => {
      const formData = new FormData();
      formData.append("queryType", queryType);
      formData.append("queryParam", queryParam);
      formData.append("skipCount", newSkipCount.toString());
      formData.append("pageSize", pageSize.toString());

      fetcher.submit(formData, { method: "post" });
    }, 0);
  };

  const handlePreviousPage = () => {
    if (skipCount >= pageSize) {
      const newSkipCount = skipCount - pageSize;
      setSkipCount(newSkipCount);
      setSelectedCrossing(null);

      setTimeout(() => {
        const formData = new FormData();
        formData.append("queryType", queryType);
        formData.append("queryParam", queryParam);
        formData.append("skipCount", newSkipCount.toString());
        formData.append("pageSize", pageSize.toString());

        fetcher.submit(formData, { method: "post" });
      }, 0);
    }
  };

  // Handle query type change
  const handleQueryTypeChange = (value: string) => {
    setQueryType(value as QueryType);

    // Set default values based on query type
    if (value === "public" || value === "private") {
      setQueryParam("");
    } else if (value === "railroad") {
      setQueryParam("METX");
    }
  };

  // Function to render crossing type as readable text
  const renderCrossingType = (type: string): string => {
    switch (type) {
      case "1":
        return "Pedestrian";
      case "2":
        return "Private";
      case "3":
        return "Public";
      default:
        return `Unknown (${type})`;
    }
  };

  // Function to render crossing status
  const renderCrossingStatus = (status: string): string => {
    if (typeof status === "string") {
      if (status === "Yes" || status === "1") return "Closed";
      if (status === "No" || status === "2") return "Open";
    }
    return "Unknown";
  };

  // Helper to format phone numbers
  const formatPhoneNumber = (phoneNumberString: string) => {
    if (!phoneNumberString) return "N/A";
    const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return phoneNumberString;
  };

  // Handle crossing selection
  const handleSelectCrossing = (crossing: Crossing) => {
    setSelectedCrossing(crossing);
  };

  // Handle back to results
  const handleBackToResults = () => {
    setSelectedCrossing(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">FRA Query Tool</h2>
          <p className="text-muted-foreground">
            Query Federal Railroad Administration Crossing Inventory System
          </p>
        </div>
      </div>

      {!selectedCrossing && (
        <fetcher.Form method="post">
          <Card>
            <CardHeader>
              <CardTitle>Build Query</CardTitle>
              <CardDescription>
                Select query parameters to search the FRA crossing database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Query Type</label>
                  <Select
                    name="queryType"
                    value={queryType}
                    onValueChange={handleQueryTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select query type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crossing">
                        Specific Crossing
                      </SelectItem>
                      <SelectItem value="railroad">Railroad</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="county">County</SelectItem>
                      <SelectItem value="public">
                        All Public Crossings
                      </SelectItem>
                      <SelectItem value="private">
                        All Private Crossings
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {queryType !== "public" && queryType !== "private" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {queryType === "crossing"
                        ? "Crossing ID"
                        : queryType === "railroad"
                        ? "Railroad Code"
                        : queryType === "state"
                        ? "State Code"
                        : "County Name"}
                    </label>
                    <Input
                      name="queryParam"
                      value={queryParam}
                      onChange={(e) => setQueryParam(e.target.value)}
                      placeholder={
                        queryType === "crossing"
                          ? "e.g., 016530M"
                          : queryType === "railroad"
                          ? "e.g., METX"
                          : queryType === "state"
                          ? "e.g., 30"
                          : "e.g., Cook"
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Results Per Page
                  </label>
                  <Select
                    name="pageSize"
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <input
                type="hidden"
                name="skipCount"
                value={skipCount.toString()}
              />

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={handleSubmitQuery}
                  disabled={isLoading}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Run Query
                </Button>
              </div>
            </CardContent>
          </Card>
        </fetcher.Form>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div>Loading FRA Data</div>
                <div>{loadingProgress}%</div>
              </div>
              <Progress value={loadingProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resultData.length > 0 && !selectedCrossing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Query Results</CardTitle>
              <CardDescription>
                Showing {skipCount + 1}-{skipCount + resultData.length} of{" "}
                {totalCount}+ crossings
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crossing ID</TableHead>
                    <TableHead>Railroad</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultData.map((crossing) => (
                    <TableRow key={crossing.CrossingId}>
                      <TableCell className="font-medium">
                        {crossing.CrossingId}
                      </TableCell>
                      <TableCell>{crossing.OperatingRailroadCode}</TableCell>
                      <TableCell>
                        {crossing.NearestCityTown || crossing.Nearest},{" "}
                        {crossing.StateNm || crossing.StateCD}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {renderCrossingType(crossing.TypeXing)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            crossing.CrossingClosed === "Yes"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {renderCrossingStatus(crossing.CrossingClosed)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectCrossing(crossing)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousPage}
                disabled={skipCount === 0 || isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {Math.floor(skipCount / pageSize) + 1}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleNextPage}
                disabled={!hasMoreResults || isLoading}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCrossing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBackToResults}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>
                  Crossing Details: {selectedCrossing.CrossingId}
                </CardTitle>
                <CardDescription>
                  Federal Railroad Administration Inventory Data
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  selectedCrossing.CrossingClosed === "Yes"
                    ? "destructive"
                    : "default"
                }
              >
                {renderCrossingStatus(selectedCrossing.CrossingClosed)}
              </Badge>
              <Badge variant="outline">
                {renderCrossingType(selectedCrossing.TypeXing)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="warning">Warning Devices</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Railroad Information
                    </h3>
                    <div className="rounded-md border p-4">
                      <p>
                        <strong>Railroad:</strong>{" "}
                        {selectedCrossing.OperatingRailroadCode}
                      </p>
                      <p>
                        <strong>Division:</strong>{" "}
                        {selectedCrossing.RrDiv || "N/A"}
                      </p>
                      <p>
                        <strong>Subdivision:</strong>{" "}
                        {selectedCrossing.RrSubDiv || "N/A"}
                      </p>
                      <p>
                        <strong>Branch:</strong>{" "}
                        {selectedCrossing.Branch || "N/A"}
                      </p>
                      <p>
                        <strong>Mile Post:</strong>{" "}
                        {selectedCrossing.MilePost || "N/A"}
                      </p>
                      <p>
                        <strong>Daily Trains:</strong>{" "}
                        {parseInt(selectedCrossing.DayThru || "0") +
                          (selectedCrossing.NghtThru || 0)}
                      </p>
                      <p>
                        <strong>Max Train Speed:</strong>{" "}
                        {selectedCrossing.MaxTtSpd || "N/A"} mph
                      </p>
                      <p>
                        <strong>Tracks:</strong>
                        Main: {selectedCrossing.MainTrk || "0"}, Siding:{" "}
                        {selectedCrossing.SidingTrk || "0"}, Yard:{" "}
                        {selectedCrossing.YardTrk || "0"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Roadway Information
                    </h3>
                    <div className="rounded-md border p-4">
                      <p>
                        <strong>Street/Highway:</strong>{" "}
                        {selectedCrossing.Street ||
                          selectedCrossing.Highway ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>AADT:</strong>{" "}
                        {parseInt(
                          selectedCrossing.Aadt?.replace(/^0+/, "") || "0"
                        ).toLocaleString() || "N/A"}
                      </p>
                      <p>
                        <strong>AADT Year:</strong>{" "}
                        {selectedCrossing.AadtYear || "N/A"}
                      </p>
                      <p>
                        <strong>Highway Speed:</strong>{" "}
                        {selectedCrossing.HwySpeed || "N/A"} mph
                      </p>
                      <p>
                        <strong>Surface Width:</strong>{" "}
                        {selectedCrossing.XSurfWidth || "N/A"} ft
                      </p>
                      <p>
                        <strong>Surface Length:</strong>{" "}
                        {selectedCrossing.XSurfLength || "N/A"} ft
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-4">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Location Information
                      </h3>
                      <div className="rounded-md border p-4">
                        <p>
                          <strong>City:</strong>{" "}
                          {selectedCrossing.NearestCityTown ||
                            selectedCrossing.Nearest ||
                            "N/A"}
                        </p>
                        <p>
                          <strong>State:</strong>{" "}
                          {selectedCrossing.StateNm ||
                            selectedCrossing.StateCD ||
                            "N/A"}
                        </p>
                        <p>
                          <strong>County:</strong>{" "}
                          {selectedCrossing.CountyNm ||
                            selectedCrossing.CountyCd ||
                            "N/A"}
                        </p>
                        <p>
                          <strong>Latitude:</strong>{" "}
                          {selectedCrossing.Latitude || "N/A"}
                        </p>
                        <p>
                          <strong>Longitude:</strong>{" "}
                          {selectedCrossing.Longitude || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="h-64 rounded-md border bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                        <p>Map would be displayed here</p>
                        <p className="text-xs">
                          Coordinates: {selectedCrossing.Latitude},{" "}
                          {selectedCrossing.Longitude}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="warning" className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Warning Devices</h3>
                <div className="rounded-md border p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {parseInt(selectedCrossing.Gates || "0") > 0 && (
                      <div className="rounded-md border p-2">
                        <p className="font-semibold">Gates</p>
                        <p className="text-2xl text-center">
                          {selectedCrossing.Gates}
                        </p>
                      </div>
                    )}

                    {parseInt(selectedCrossing.FlashOv || "0") > 0 && (
                      <div className="rounded-md border p-2">
                        <p className="font-semibold">Overhead Flashers</p>
                        <p className="text-2xl text-center">
                          {selectedCrossing.FlashOv}
                        </p>
                      </div>
                    )}

                    {parseInt(selectedCrossing.FlashNov || "0") > 0 && (
                      <div className="rounded-md border p-2">
                        <p className="font-semibold">Flashers</p>
                        <p className="text-2xl text-center">
                          {selectedCrossing.FlashNov}
                        </p>
                      </div>
                    )}

                    {parseInt(selectedCrossing.XBuck || "0") > 0 && (
                      <div className="rounded-md border p-2">
                        <p className="font-semibold">Crossbucks</p>
                        <p className="text-2xl text-center">
                          {selectedCrossing.XBuck}
                        </p>
                      </div>
                    )}

                    {parseInt(selectedCrossing.StopStd || "0") > 0 && (
                      <div className="rounded-md border p-2">
                        <p className="font-semibold">Stop Signs</p>
                        <p className="text-2xl text-center">
                          {selectedCrossing.StopStd}
                        </p>
                      </div>
                    )}

                    {parseInt(selectedCrossing.YieldStd || "0") > 0 && (
                      <div className="rounded-md border p-2">
                        <p className="font-semibold">Yield Signs</p>
                        <p className="text-2xl text-center">
                          {selectedCrossing.YieldStd}
                        </p>
                      </div>
                    )}

                    {parseInt(selectedCrossing.Bells || "0") > 0 && (
                      <div className="rounded-md border p-2">
                        <p className="font-semibold">Bells</p>
                        <p className="text-2xl text-center">
                          {selectedCrossing.Bells}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  Contact Information
                </h3>
                <div className="rounded-md border p-4">
                  <p>
                    <strong>Railroad Contact:</strong>{" "}
                    {formatPhoneNumber(selectedCrossing.RrCont)}
                  </p>
                  <p>
                    <strong>Highway Authority:</strong>{" "}
                    {formatPhoneNumber(selectedCrossing.HwyCont)}
                  </p>
                  <p>
                    <strong>Emergency Contact:</strong>{" "}
                    {formatPhoneNumber(selectedCrossing.PolCont)}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {selectedCrossing.RevisionDate
                      ? new Date(
                          selectedCrossing.RevisionDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleBackToResults}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
