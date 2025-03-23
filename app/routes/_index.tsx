import { Link } from "react-router";
import { ArrowRight, FileText, Map, MapPin, Settings, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DashboardStats } from "~/components/dashboardStats";
import { RecentChanges } from "~/components/recentChanges";
import { CrossingMap } from "~/components/crossingMap";
import { useLoaderData } from "react-router";
import { db } from "~/lib/db";
import { railroadCrossings } from "~/db/schema";
import { desc, isNotNull, sql, count } from "drizzle-orm";
import type { MapCrossing } from "~/routes/map";

// Dashboard statistics type
type DashboardData = {
  totalCrossings: number;
  publicCrossings: number;
  privateCrossings: number;
  pedestrianCrossings: number;
  complianceRate: number;
  pendingUpdates: number;
  highRiskCrossings: number;
  recentChanges: {
    id: string;
    crossing: string;
    user: string;
    userInitials: string;
    action: string;
    timestamp: string;
  }[];
  mapCrossings: MapCrossing[];
};

// Loader function to fetch dashboard data
export async function loader() {
  try {
    // Get total count of crossings
    const totalCount = await db
      .select({ count: count() })
      .from(railroadCrossings);
    
    // Count public crossings
    const publicCount = await db
      .select({ count: count() })
      .from(railroadCrossings)
      .where(sql`${railroadCrossings.crossing_type} LIKE '%public%'`);
    
    // Count private crossings
    const privateCount = await db
      .select({ count: count() })
      .from(railroadCrossings)
      .where(sql`${railroadCrossings.crossing_type} LIKE '%private%'`);
    
    // Count pedestrian crossings
    const pedestrianCount = await db
      .select({ count: count() })
      .from(railroadCrossings)
      .where(sql`${railroadCrossings.crossing_type} LIKE '%pedestrian%'`);
    
    // Get recent crossings with coordinates for the map
    const mapCrossings = await db
      .select({
        id: railroadCrossings.crossing_id,
        name: railroadCrossings.street,
        latitude: railroadCrossings.latitude,
        longitude: railroadCrossings.longitude,
        type: railroadCrossings.crossing_type,
        device: railroadCrossings.wd_code,
      })
      .from(railroadCrossings)
      .where(isNotNull(railroadCrossings.latitude))
      .where(isNotNull(railroadCrossings.longitude))
      .orderBy(desc(railroadCrossings.revision_date))
      .limit(50);

    // Format data for the map
    const formattedMapCrossings: MapCrossing[] = mapCrossings
      .filter(crossing => crossing.latitude && crossing.longitude)
      .map(crossing => {
        // Determine crossing type
        let typeLabel = "unknown";
        if (crossing.type) {
          const typeLower = crossing.type.toLowerCase();
          if (typeLower.includes("public")) typeLabel = "public";
          else if (typeLower.includes("private")) typeLabel = "private";
          else if (typeLower.includes("pedestrian")) typeLabel = "pedestrian";
        }

        // Determine warning device type
        let deviceLabel = "unknown";
        if (crossing.device) {
          const deviceCode = crossing.device.toUpperCase();
          if (deviceCode.includes("GATES")) deviceLabel = "gates";
          else if (deviceCode.includes("FLASH")) deviceLabel = "flashers";
          else if (deviceCode.includes("PASSV")) deviceLabel = "passive";
        }

        return {
          id: crossing.id,
          name: crossing.name || `Crossing ${crossing.id}`,
          coordinates: [
            Number(crossing.longitude),
            Number(crossing.latitude)
          ],
          type: typeLabel,
          device: deviceLabel
        };
      });

    // Get 5 most recently updated crossings for the changes list
    const recentlyUpdated = await db
      .select({
        id: railroadCrossings.crossing_id,
        name: railroadCrossings.street,
        revision_date: railroadCrossings.revision_date,
        reporting_agency: railroadCrossings.reporting_agency_name,
      })
      .from(railroadCrossings)
      .orderBy(desc(railroadCrossings.revision_date))
      .limit(5);

    // Format the recent changes
    const recentChanges = recentlyUpdated.map(crossing => {
      const agency = crossing.reporting_agency || "Unknown Agency";
      const initials = agency
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2);
      
      return {
        id: crossing.id,
        crossing: `Crossing #${crossing.id}`,
        user: agency,
        userInitials: initials,
        action: "Updated crossing data",
        timestamp: crossing.revision_date 
          ? new Date(crossing.revision_date).toLocaleDateString() 
          : "Unknown date"
      };
    });

    // Sample data for stats we can't easily calculate from the database
    // In a real app, these would be calculated from database fields
    const dashboardData: DashboardData = {
      totalCrossings: totalCount[0]?.count || 0,
      publicCrossings: publicCount[0]?.count || 0,
      privateCrossings: privateCount[0]?.count || 0,
      pedestrianCrossings: pedestrianCount[0]?.count || 0,
      complianceRate: 94.3, // Placeholder - would need calculation logic
      pendingUpdates: 23,    // Placeholder - would need calculation logic
      highRiskCrossings: 7,  // Placeholder - would need calculation logic
      recentChanges,
      mapCrossings: formattedMapCrossings
    };

    return { 
      dashboardData,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export default function Dashboard() {
  const { dashboardData, success, error } = useLoaderData<typeof loader>();

  // If loading failed, show error
  if (!success) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Railroad Crossing Inventory Management System</p>
        </div>
        
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <h2 className="text-lg font-bold">Error Loading Dashboard</h2>
          <p>{error || "An unknown error occurred while loading dashboard data."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Railroad Crossing Inventory Management System</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/crossings/new">
              <MapPin className="mr-2 h-4 w-4" />
              Add New Crossing
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Crossings</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalCrossings.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500 mr-1">+12</span> from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.complianceRate}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500 mr-1">+2.1%</span> from last quarter
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Updates</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.pendingUpdates}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-red-500 mr-1">+5</span> from last week
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Crossings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.highRiskCrossings}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500 mr-1">-2</span> from last assessment
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Management</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Manage FRA Crossing Inventory Form 6180.71 data</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/crossings">
                    View Inventory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Field Data Collection</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Collect crossing data in the field with offline support</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/field-collection">
                    Start Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Map View</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Interactive map of all Railroad crossings</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/map">
                    Open Map
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Changes</CardTitle>
                <CardDescription>Recent updates to crossing inventory data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dashboardData.recentChanges.map((change) => (
                    <div className="flex items-center" key={change.id}>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`/avatar.jpg`} alt={change.user} />
                        <AvatarFallback>{change.userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{change.crossing}</p>
                        <p className="text-sm text-muted-foreground">
                          {change.user} {change.action}
                        </p>
                      </div>
                      <div className="ml-auto font-medium text-sm text-muted-foreground">{change.timestamp}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/history">View All History</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Crossing Map</CardTitle>
                <CardDescription>Overview of Railroad crossings</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <CrossingMap loadedCrossings={dashboardData.mapCrossings} />
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/map">Open Full Map</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Railroad Crossing Map</CardTitle>
              <CardDescription>Interactive map of all Railroad crossings in the system</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              <CrossingMap fullscreen loadedCrossings={dashboardData.mapCrossings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and export reports for FRA compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="mb-2 h-5 w-5" />
                  FRA Form 6180.71
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="mb-2 h-5 w-5" />
                  Crossing Inventory Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="mb-2 h-5 w-5" />
                  APS Risk Assessment
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="mb-2 h-5 w-5" />
                  Change History Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="mb-2 h-5 w-5" />
                  Compliance Status
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="mb-2 h-5 w-5" />
                  Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Need to import these components
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";