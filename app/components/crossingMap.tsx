import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Sample crossing data - in a real app, this would come from an API
const crossings = [
  { id: "123456", name: "Main Street Crossing", coordinates: [-87.6298, 41.8781], type: "public", device: "gates" },
  { id: "789012", name: "Oak Avenue Crossing", coordinates: [-87.7831, 41.9742], type: "public", device: "flashers" },
  { id: "345678", name: "Industrial Park Access", coordinates: [-88.0834, 41.5250], type: "private", device: "passive" },
  { id: "901234", name: "River Road Crossing", coordinates: [-88.1503, 41.7508], type: "public", device: "gates" },
  { id: "567890", name: "County Line Road", coordinates: [-88.3201, 41.7656], type: "public", device: "flashers" },
];

// Replace with your actual MapBox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9ycmlzb25hayIsImEiOiJjbDdwOGh2OXQyMDhlM29tcWNuajdpdGV0In0.qSeAKGs8erp-QGCDXMTy0g';

interface CrossingMapProps {
  fullscreen?: boolean;
  centerCoordinates?: [number, number];
  zoom?: number;
}

export function CrossingMap({ 
  fullscreen = false, 
  centerCoordinates = [-87.6298, 41.8781], // Chicago coordinates as default
  zoom = 9 
}: CrossingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [filteredCrossings, setFilteredCrossings] = useState(crossings);
  const [typeFilter, setTypeFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize MapBox map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centerCoordinates,
      zoom: zoom
    });
    
    map.current.on('load', () => {
      setIsMapLoaded(true);
      
      // Add markers for each crossing
      addMarkers(crossings);
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [centerCoordinates, zoom]);
  
  // Function to add markers to the map
  const addMarkers = (crossingsToShow: typeof crossings) => {
    if (!map.current || !isMapLoaded) return;
    
    // Remove existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Add new markers
    crossingsToShow.forEach(crossing => {
      // Create a custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `<div class="p-1 bg-white rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`;
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(crossing.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3 class="font-semibold">${crossing.name}</h3>
              <p>ID: ${crossing.id}</p>
              <p>Type: ${crossing.type}</p>
              <p>Warning Device: ${crossing.device}</p>
            `)
        )
        .addTo(map.current);
    });
  };
  
  // Handle filtering
  const applyFilters = () => {
    let filtered = crossings;
    
    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(crossing => crossing.type === typeFilter);
    }
    
    // Apply device filter
    if (deviceFilter !== "all") {
      filtered = filtered.filter(crossing => crossing.device === deviceFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(crossing => 
        crossing.name.toLowerCase().includes(term) || 
        crossing.id.includes(term)
      );
    }
    
    setFilteredCrossings(filtered);
    addMarkers(filtered);
  };
  
  // Reset filters
  const resetFilters = () => {
    setTypeFilter("all");
    setDeviceFilter("all");
    setSearchTerm("");
    setFilteredCrossings(crossings);
    addMarkers(crossings);
  };
  
  // Apply filters when they change
  useEffect(() => {
    if (isMapLoaded) {
      applyFilters();
    }
  }, [isMapLoaded, typeFilter, deviceFilter, searchTerm]);

  return (
    <div className="flex h-full flex-col">
      {fullscreen && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input 
            placeholder="Search crossings..." 
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
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
          <Button variant="outline" size="sm" onClick={applyFilters}>
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      )}

      <div 
        ref={mapContainer} 
        className={`relative flex-1 rounded-md border ${isMapLoaded ? "" : "bg-muted animate-pulse"}`}
      >
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            Loading map...
          </div>
        )}
      </div>
    </div>
  );
}