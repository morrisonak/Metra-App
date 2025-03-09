import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CrossingMap } from "~/components/crossingMap";

export default function MapPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Map View</h2>
        <p className="text-muted-foreground">Interactive map of all railway crossings</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Railway Crossing Map</CardTitle>
          <CardDescription>View and filter all railway crossings in the system</CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100vh-16rem)]">
          <CrossingMap fullscreen />
        </CardContent>
      </Card>
    </div>
  );
}