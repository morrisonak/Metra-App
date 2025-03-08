import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

interface CrossingMapProps {
  fullscreen?: boolean;
}

export function CrossingMap({ fullscreen = false }: CrossingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // This would be replaced with actual map initialization code
    // using Leaflet or Mapbox
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {fullscreen && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input placeholder="Search crossings..." className="max-w-xs" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Crossing Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="pedestrian">Pedestrian</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Warning Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="gates">Gates</SelectItem>
              <SelectItem value="flashers">Flashers</SelectItem>
              <SelectItem value="passive">Passive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Reset
          </Button>
        </div>
      )}

      <div ref={mapRef} className={`relative flex-1 rounded-md border bg-muted ${isMapLoaded ? "" : "animate-pulse"}`}>
        {!isMapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">Loading map...</div>
        ) : (
          <div className="absolute inset-0">
            {/* This would be replaced with actual map rendering */}
            <div className="absolute left-1/4 top-1/3">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute left-1/2 top-1/2">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute left-2/3 top-1/4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute left-1/3 top-2/3">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute left-3/4 top-3/5">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}