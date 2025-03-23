import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CrossingMap } from "~/components/crossingMap";
import { useLoaderData } from "react-router";
import { db } from "~/lib/db";
import { railroadCrossings } from "~/db/schema";
import { asc, isNotNull } from "drizzle-orm";

// Type for the crossing data to be passed to the map
export type MapCrossing = {
  id: string;
  name: string;
  coordinates: [number, number];
  type: string;
  device: string;
};

// Loader function to fetch crossing data with coordinates
export async function loader() {
  try {
    // Fetch crossings with valid coordinates
    const crossingsData = await db.select({
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
    .orderBy(asc(railroadCrossings.crossing_id))
    .limit(500); // Limit to 500 crossings for performance

    // Transform data for the map component
    const mappedCrossings: MapCrossing[] = crossingsData.map(crossing => {
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

    return { 
      crossings: mappedCrossings, 
      success: true,
      total: mappedCrossings.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching crossings for map:', error);
    return { 
      crossings: [], 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export default function MapPage() {
  const { crossings, success, total, error } = useLoaderData<typeof loader>();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Map View</h2>
        <p className="text-muted-foreground">Interactive map of all Railroad crossings</p>
      </div>
      
      {!success ? (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Map Data</CardTitle>
            <CardDescription>There was a problem loading the crossing data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
              <p>{error || "An unknown error occurred while loading crossing data."}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Railroad Crossing Map</CardTitle>
            <CardDescription>
              Showing {total} crossings. Use the filters below to refine the view.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100vh-16rem)]">
            <CrossingMap 
              fullscreen 
              loadedCrossings={crossings}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}