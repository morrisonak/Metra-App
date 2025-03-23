import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapCrossing } from "~/routes/map";

// Sample crossing data as fallback
const sampleCrossings = [
  { id: "123456", name: "Main Street Crossing", coordinates: [-87.6298, 41.8781], type: "public", device: "gates" },
  { id: "789012", name: "Oak Avenue Crossing", coordinates: [-87.7831, 41.9742], type: "public", device: "flashers" },
  { id: "345678", name: "Industrial Park Access", coordinates: [-88.0834, 41.5250], type: "private", device: "passive" },
];

// Replace with your actual MapBox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9ycmlzb25hayIsImEiOiJjbDdwOGh2OXQyMDhlM29tcWNuajdpdGV0In0.qSeAKGs8erp-QGCDXMTy0g';

interface CrossingMapProps {
  fullscreen?: boolean;
  centerCoordinates?: [number, number];
  zoom?: number;
  showSingleMarker?: boolean;
  loadedCrossings?: MapCrossing[];
}

export function CrossingMap({ 
  fullscreen = false, 
  centerCoordinates = [-87.6298, 41.8781], // Chicago coordinates as default
  zoom = 9,
  showSingleMarker = false,
  loadedCrossings
}: CrossingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Use loaded crossings if provided, otherwise use sample data
  const allCrossings = loadedCrossings || sampleCrossings;
  
  const [filteredCrossings, setFilteredCrossings] = useState(allCrossings);
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
      
      if (showSingleMarker) {
        // Add a single marker at the specified coordinates
        addSingleMarker(centerCoordinates);
      } else {
        // Add markers for crossings
        addMarkers(filteredCrossings);
      }
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [centerCoordinates, zoom, showSingleMarker]);
  
  // Re-filter crossings when the loaded crossings change
  useEffect(() => {
    if (loadedCrossings) {
      setFilteredCrossings(loadedCrossings);
    }
  }, [loadedCrossings]);
  
  // Function to add a single marker to the map
  const addSingleMarker = (coordinates: [number, number]) => {
    if (!map.current || !isMapLoaded) return;
    
    // Remove existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Create a custom marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'custom-marker';
    markerEl.innerHTML = `<div class="p-1 bg-primary rounded-full shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>`;
    
    // Create and add the marker
    new mapboxgl.Marker(markerEl)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3 class="font-semibold">Railroad Crossing</h3>
            <p>Coordinates: ${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}</p>
          `)
      )
      .addTo(map.current);
  };
  
  // Function to add markers to the map
  const addMarkers = (crossingsToShow: MapCrossing[]) => {
    if (!map.current || !isMapLoaded) return;
    
    // Remove existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // If we have too many markers, cluster them based on zoom level
    // But for now just limit the count to prevent browser performance issues
    const maxMarkers = 200;
    const displayCrossings = crossingsToShow.slice(0, maxMarkers);
    
    // Fit bounds to the crossings if we have any
    if (displayCrossings.length > 0 && !showSingleMarker) {
      const bounds = new mapboxgl.LngLatBounds();
      displayCrossings.forEach(crossing => {
        bounds.extend(crossing.coordinates);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
    
    // Add new markers
    displayCrossings.forEach(crossing => {
      // Get color based on crossing type
      let color = "text-blue-500";
      if (crossing.type === "private") color = "text-amber-500";
      else if (crossing.type === "pedestrian") color = "text-green-500";
      
      // Create a custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `<div class="p-1 bg-white rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${color}">
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
              <a href="/crossings/${crossing.id}" class="text-blue-500 font-medium hover:underline">View Details</a>
            `)
        )
        .addTo(map.current);
    });
    
    // Show info about limited markers if necessary
    if (crossingsToShow.length > maxMarkers) {
      const overageCount = crossingsToShow.length - maxMarkers;
      
      // Add an alert element to the map
      const alertEl = document.createElement('div');
      alertEl.className = 'bg-white p-2 rounded shadow-lg absolute bottom-4 left-4 z-10 max-w-xs';
      alertEl.innerHTML = `
        <p class="text-sm font-medium">Showing ${maxMarkers} of ${crossingsToShow.length} crossings</p>
        <p class="text-xs text-muted-foreground">Use filters to narrow results</p>
      `;
      
      // Add to the map container
      mapContainer.current?.appendChild(alertEl);
    }
  };
  
  // Handle filtering
  const applyFilters = () => {
    if (!allCrossings) return;
    
    let filtered = allCrossings;
    
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
    setFilteredCrossings(allCrossings);
    addMarkers(allCrossings);
  };
  
  // Apply filters when they change
  useEffect(() => {
    if (isMapLoaded && !showSingleMarker) {
      applyFilters();
    }
  }, [isMapLoaded, typeFilter, deviceFilter, searchTerm, showSingleMarker]);

  return (
    <div className="flex h-full flex-col">
      {fullscreen && !showSingleMarker && (
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
      
      {filteredCrossings.length === 0 && isMapLoaded && !showSingleMarker && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="bg-white p-4 rounded-md shadow-lg text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">No crossings found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
            <Button className="mt-2" variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}