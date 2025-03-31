import { Link, useParams } from "react-router";
import { ArrowLeft, Download, Edit, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { CrossingMap } from "~/components/crossingMap";
import { useLoaderData } from "react-router";
import { db } from "~/lib/db";
import { railroadCrossings } from "~/db/schema";
import { eq } from "drizzle-orm";

// Type definition for our crossing data
type CrossingDetail = {
  id: string;
  name: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  type: string | null;
  warningDevice: string | null;
  lastUpdated: string | null;
  status: string | null;
  roadway: {
    name: string | null;
    type: string | null;
    aadt: number | null;
    speedLimit: number | null;
    lanes: number | null;
  };
  railroad: {
    company: string | null;
    subdivision: string | null;
    division: string | null;
    trainCount: number | null;
    maxSpeed: number | null;
    tracks: number | null;
    milepost: string | null;
  };
  safety: {
    whistleBan: string | null;
    whistleBanDate: string | null;
    schoolBusRoute: string | null;
    gates: number | null;
    flashingLights: number | null;
    bells: number | null;
  };
  fraData: {
    inventoryNumber: string;
    reportingAgency: string | null;
    reportingRailroad: string | null;
    lastSubmitted: string | null;
    quietZoneId: string | null;
    apsRiskScore: number | null;
    apsRiskCategory: string | null;
    url: string | null; // Add this line
  }
};

// Loader function to fetch crossing details by ID
export async function loader({ params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) throw new Error("Crossing ID is required");

    // Fetch crossing data from database
    const crossingData = await db.select()
      .from(railroadCrossings)
      .where(eq(railroadCrossings.crossing_id, id))
      .limit(1);

    if (!crossingData || crossingData.length === 0) {
      return { 
        success: false, 
        error: `Crossing with ID ${id} not found` 
      };
    }

    console.log("Crossing data fetched successfully:", crossingData);
    const data = crossingData[0];

    // Calculate total number of trains
    const totalTrains = (
      (data.total_daylight_thru_trains || 0) + 
      (data.total_nighttime_thru_trains || 0) +
      (data.total_switching_trains || 0) +
      (data.total_transit_trains || 0)
    );

    // Calculate total number of tracks
    const totalTracks = (
      (data.number_of_main_tracks || 0) +
      (data.number_of_siding_tracks || 0) +
      (data.number_of_yard_tracks || 0) +
      (data.number_of_transit_tracks || 0) +
      (data.number_of_industry_tracks || 0)
    );

    // Calculate total number of flashing lights
    const totalFlashingLights = (
      (data.count_flashing_light_pair || 0) +
      (data.count_cantilever_over_lane || 0) +
      (data.count_cantilever_no_lane || 0) +
      (data.count_mast_mounted_flashing_light || 0) +
      (data.count_other_flashing_lights || 0)
    );

    // Format the data into our expected structure
    const crossing: CrossingDetail = {
      id: data.crossing_id,
      name: data.street || data.highway_name,
      city: data.city_name,
      state: data.state_name,
      latitude: data.latitude ? parseFloat(data.latitude.toString()) : null,
      longitude: data.longitude ? parseFloat(data.longitude.toString()) : null,
      type: data.crossing_type,
      warningDevice: data.wd_code,
      lastUpdated: data.revision_date?.toString() || null,
      status: data.report_status,
      roadway: {
        name: data.street || data.highway_name,
        type: data.crossing_purpose || "Unknown",
        aadt: data.aadt ? parseInt(data.aadt.toString()) : null,
        speedLimit: data.speed_limit ? parseInt(data.speed_limit.toString()) : null,
        lanes: data.traffic_lane ? parseInt(data.traffic_lane.toString()) : null,
      },
      railroad: {
        company: data.railroad_name,
        subdivision: data.railroad_subdivision,
        division: data.railroad_division,
        trainCount: totalTrains,
        maxSpeed: data.maximum_timetable_speed,
        tracks: totalTracks,
        milepost: data.railroad_milepost_number
      },
      safety: {
        whistleBan: data.whistle_ban,
        whistleBanDate: data.whistle_date?.toString() || null,
        schoolBusRoute: data.school_bus_route,
        gates: data.count_roadway_gate_arms,
        flashingLights: totalFlashingLights,
        bells: data.number_of_bells
      },
      fraData: {
        inventoryNumber: data.crossing_id,
        reportingAgency: data.reporting_agency_name,
        reportingRailroad: data.reporting_railroad_company_grouping,
        lastSubmitted: data.last_update_date?.toString() || data.revision_date?.toString() || null,
        quietZoneId: data.ccm_qz_id,
        apsRiskScore: 0.023, // Placeholder - would need to be calculated or fetched from a different source
        apsRiskCategory: "Low", // Placeholder - would need to be calculated or fetched from a different source
        url: data.url ? JSON.parse(data.url).url : null,
      }
    };

    // Mock history data - in a real app this would be fetched from a separate table
    const history = [
      {
        date: data.revision_date ? new Date(data.revision_date).toLocaleDateString() : "Unknown",
        user: data.reporting_agency_name || "System",
        action: "Updated inventory data",
      },
      {
        date: "2023-10-20",
        user: "Field Technician",
        action: "Field verification completed",
      },
      {
        date: "2023-08-05",
        user: "System",
        action: "Initial inventory created",
      },
    ];

    return { 
      crossing, 
      history,
      success: true 
    };
  } catch (error) {
    console.error("Error fetching crossing:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}

// Helper function to determine crossing type display
const getCrossingType = (type: string | null) => {
  if (!type) return "Unknown";
  
  const typeLower = type?.toLowerCase() || "";
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

// Helper function to determine crossing status
const getCrossingStatus = (crossing: CrossingDetail) => {
  if (crossing.status?.toLowerCase() === "published") return "Compliant";
  if (crossing.status?.toLowerCase() === "inactive") return "Non-Compliant";
  if (crossing.status?.toLowerCase() === "failed") return "Non-Compliant";
  
  return "Pending Review";
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

export default function CrossingDetailsPage() {
  const { crossing, history, success, error } = useLoaderData<typeof loader>();
  const params = useParams();
  const id = params.id;
  const crossingStatus = success ? getCrossingStatus(crossing) : "Unknown";

  // If loading failed, show error
  if (!success) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/crossings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Crossing Details</h2>
          </div>
        </div>
        
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <h2 className="text-lg font-bold">Error Loading Crossing</h2>
          <p>{error || "An unknown error occurred while loading crossing data."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/crossings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{crossing.name || "Unnamed Crossing"}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge className="text-xs">DOT: {crossing.id}</Badge>
              <Badge
                variant={
                  crossingStatus === "Compliant"
                    ? "default"
                    : crossingStatus === "Non-Compliant"
                      ? "destructive"
                      : "outline"
                }
              >
                {crossingStatus}
              </Badge>
              {crossing.safety.whistleBan && (
                <Badge variant="outline">Quiet Zone</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button variant="outline" className="hidden sm:flex" asChild>
  <a href={crossing.fraData.url} target="_blank" rel="noopener noreferrer">
    <Download className="mr-2 h-4 w-4" />
    Export FRA Form
  </a>
</Button>
          <Button asChild className="hidden sm:flex">
            <Link to={`/crossings/${crossing.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Crossing
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="sm:hidden" asChild>
            <Link to={`/crossings/${crossing.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="fra-data">FRA Data</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
            <Card>
              <CardHeader>
                <CardTitle>Crossing Information</CardTitle>
                <CardDescription>Basic crossing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Name:</div>
                  <div className="text-sm">{crossing.name || "Unnamed Crossing"}</div>

                  <div className="text-sm font-medium">Location:</div>
                  <div className="text-sm">
                    {crossing.city || "Unknown"}, {crossing.state || "Unknown"}
                  </div>

                  <div className="text-sm font-medium">Type:</div>
                  <div className="text-sm">{getCrossingType(crossing.type)}</div>

                  <div className="text-sm font-medium">Warning Device:</div>
                  <div className="text-sm">{getWarningDevice(crossing.warningDevice)}</div>

                  <div className="text-sm font-medium">Last Updated:</div>
                  <div className="text-sm">{formatDate(crossing.lastUpdated)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Roadway Information</CardTitle>
                <CardDescription>Details about the roadway</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Road Name:</div>
                  <div className="text-sm">{crossing.roadway.name || "Unknown"}</div>

                  <div className="text-sm font-medium">Road Type:</div>
                  <div className="text-sm">{crossing.roadway.type || "Unknown"}</div>

                  <div className="text-sm font-medium">Traffic Lanes:</div>
                  <div className="text-sm">{crossing.roadway.lanes || "Unknown"}</div>

                  <div className="text-sm font-medium">Speed Limit:</div>
                  <div className="text-sm">{crossing.roadway.speedLimit ? crossing.roadway.speedLimit + " mph" : "Unknown"}</div>

                  <div className="text-sm font-medium">School Bus Route:</div>
                  <div className="text-sm">{crossing.safety.schoolBusRoute === "Yes" ? "Yes" : "No"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Railroad Information</CardTitle>
                <CardDescription>Details about the railroad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Company:</div>
                  <div className="text-sm">{crossing.railroad.company || "Unknown"}</div>

                  <div className="text-sm font-medium">Division:</div>
                  <div className="text-sm">{crossing.railroad.division || "Unknown"}</div>
                  
                  <div className="text-sm font-medium">Subdivision:</div>
                  <div className="text-sm">{crossing.railroad.subdivision || "Unknown"}</div>

                  <div className="text-sm font-medium">Milepost:</div>
                  <div className="text-sm">{crossing.railroad.milepost || "Unknown"}</div>
                  
                  <div className="text-sm font-medium">Daily Trains:</div>
                  <div className="text-sm">{crossing.railroad.trainCount || "Unknown"}</div>

                  <div className="text-sm font-medium">Max Speed:</div>
                  <div className="text-sm">{crossing.railroad.maxSpeed ? crossing.railroad.maxSpeed + " mph" : "Unknown"}</div>

                  <div className="text-sm font-medium">Tracks:</div>
                  <div className="text-sm">{crossing.railroad.tracks || "Unknown"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Geographic location of the crossing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm font-medium">Latitude</div>
                  <div className="text-sm md:text-base">{crossing.latitude || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Longitude</div>
                  <div className="text-sm md:text-base">{crossing.longitude || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">City</div>
                  <div className="text-sm md:text-base">{crossing.city || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">State</div>
                  <div className="text-sm md:text-base">{crossing.state || "Unknown"}</div>
                </div>
              </div>

              <div className="h-[300px] sm:h-[400px] rounded-md border">
                {crossing.latitude && crossing.longitude ? (
                  <CrossingMap 
                  centerCoordinates={[crossing.longitude, crossing.latitude]} 
                  zoom={14}
                  showSingleMarker={true}
                />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MapPin className="mx-auto h-12 w-12 mb-2" />
                      <p>No location coordinates available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Information</CardTitle>
              <CardDescription>Warning devices and safety features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-md border p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-medium">Gates</div>
                  <div className="text-2xl font-bold mt-1">{crossing.safety.gates || 0}</div>
                </div>
                <div className="rounded-md border p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-medium">Flashing Lights</div>
                  <div className="text-2xl font-bold mt-1">{crossing.safety.flashingLights || 0}</div>
                </div>
                <div className="rounded-md border p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-medium">Bells</div>
                  <div className="text-2xl font-bold mt-1">{crossing.safety.bells || 0}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Quiet Zone Information</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm font-medium">Whistle Ban</div>
                    <div>{crossing.safety.whistleBan || "None"}</div>
                  </div>
                  {crossing.safety.whistleBanDate && (
                    <div>
                      <div className="text-sm font-medium">Effective Date</div>
                      <div>{formatDate(crossing.safety.whistleBanDate)}</div>
                    </div>
                  )}
                  {crossing.fraData.quietZoneId && (
                    <div>
                      <div className="text-sm font-medium">Quiet Zone ID</div>
                      <div>{crossing.fraData.quietZoneId}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Traffic Information</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm font-medium">School Bus Route</div>
                    <div>{crossing.safety.schoolBusRoute === "Yes" ? "Yes" : "No"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Traffic Lanes</div>
                    <div>{crossing.roadway.lanes || "Unknown"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Speed Limit</div>
                    <div>{crossing.roadway.speedLimit ? crossing.roadway.speedLimit + " mph" : "Unknown"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fra-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FRA Data</CardTitle>
              <CardDescription>Federal Railroad Administration inventory data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium">FRA Inventory Number</div>
                  <div>{crossing.fraData.inventoryNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Reporting Agency</div>
                  <div>{crossing.fraData.reportingAgency || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Railroad Company Type</div>
                  <div>{crossing.fraData.reportingRailroad || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Last Submitted</div>
                  <div>{formatDate(crossing.fraData.lastSubmitted)}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">APS Risk Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Based on the FRA Accident Prediction and Severity (APS) model
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risk Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{crossing.fraData.apsRiskCategory || "Unknown"}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Predicted Accident Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{crossing.fraData.apsRiskScore ? `${crossing.fraData.apsRiskScore} accidents/year` : "Unknown"}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>Record of changes to this crossing inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {history.map((item, index) => (
                  <div className="flex items-center" key={index}>
                    <div className="mr-4 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        By {item.user} on {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile action buttons at bottom of screen */}
      <div className="fixed bottom-4 right-4 flex sm:hidden gap-2">
        <Button size="sm" variant="outline" className="rounded-full h-12 w-12 shadow-lg p-0 flex items-center justify-center">
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}