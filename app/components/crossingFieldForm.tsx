import { useState } from "react";
import { Camera, PlusCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";

export function CrossingFieldForm() {
  const [photos, setPhotos] = useState<string[]>([]);
  
  const addPhoto = () => {
    // In a real app, this would open the camera or file picker
    // Here we're just adding a placeholder
    setPhotos([...photos, "photo-placeholder.jpg"]);
  };

  return (
    <div className="space-y-6">
      {/* Crossing Identification */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Crossing Identification</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dot-number">DOT Number</Label>
            <Input id="dot-number" placeholder="e.g. 123456A" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crossing-name">Crossing Name</Label>
            <Input id="crossing-name" placeholder="e.g. Main Street Crossing" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Location Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Location</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="0.000001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="0.000001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="use-current-location">Current Location</Label>
            <Button 
              id="use-current-location" 
              variant="outline" 
              className="w-full"
            >
              Use Current Location
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input id="county" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select defaultValue="IL">
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="IN">Indiana</SelectItem>
                <SelectItem value="WI">Wisconsin</SelectItem>
                <SelectItem value="MI">Michigan</SelectItem>
                <SelectItem value="IA">Iowa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Crossing Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Crossing Details</h3>
        
        <div className="space-y-2">
          <Label>Crossing Type</Label>
          <RadioGroup defaultValue="public">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="crossing-public" />
              <Label htmlFor="crossing-public">Public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="crossing-private" />
              <Label htmlFor="crossing-private">Private</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pedestrian" id="crossing-pedestrian" />
              <Label htmlFor="crossing-pedestrian">Pedestrian</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="warning-device">Warning Device Type</Label>
            <Select>
              <SelectTrigger id="warning-device">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gates">Gates</SelectItem>
                <SelectItem value="flashers">Flashers</SelectItem>
                <SelectItem value="passive">Passive</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="surface-type">Surface Type</Label>
            <Select>
              <SelectTrigger id="surface-type">
                <SelectValue placeholder="Select surface type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asphalt">Asphalt</SelectItem>
                <SelectItem value="concrete">Concrete</SelectItem>
                <SelectItem value="timber">Timber</SelectItem>
                <SelectItem value="rubber">Rubber</SelectItem>
                <SelectItem value="gravel">Gravel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Roadway Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Roadway Information</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="roadway-name">Roadway Name</Label>
            <Input id="roadway-name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roadway-type">Roadway Type</Label>
            <Select>
              <SelectTrigger id="roadway-type">
                <SelectValue placeholder="Select roadway type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city-street">City Street</SelectItem>
                <SelectItem value="county-road">County Road</SelectItem>
                <SelectItem value="state-highway">State Highway</SelectItem>
                <SelectItem value="federal-highway">Federal Highway</SelectItem>
                <SelectItem value="private-road">Private Road</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="speed-limit">Speed Limit (mph)</Label>
            <Input id="speed-limit" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aadt">AADT (vehicles/day)</Label>
            <Input id="aadt" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lanes">Number of Lanes</Label>
            <Input id="lanes" type="number" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Railroad Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Railroad Information</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="railroad-company">Railroad Company</Label>
            <Input id="railroad-company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subdivision">Subdivision</Label>
            <Input id="subdivision" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="track-count">Number of Tracks</Label>
            <Input id="track-count" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="train-count">Trains per Day</Label>
            <Input id="train-count" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-speed">Max Train Speed (mph)</Label>
            <Input id="max-speed" type="number" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Inspection Checklist */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Inspection Checklist</h3>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="check-signs" />
            <Label htmlFor="check-signs">Signs in good condition</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="check-markings" />
            <Label htmlFor="check-markings">Pavement markings visible</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="check-signals" />
            <Label htmlFor="check-signals">Signals functioning properly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="check-gates" />
            <Label htmlFor="check-gates">Gates functioning properly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="check-surface" />
            <Label htmlFor="check-surface">Crossing surface in good condition</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="check-visibility" />
            <Label htmlFor="check-visibility">Adequate sight distance</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notes</h3>
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea id="notes" placeholder="Enter any additional observations or notes about this crossing" className="min-h-[100px]" />
        </div>
      </div>
      
      <Separator />
      
      {/* Photos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Photos</h3>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-md border bg-muted">
              {/* This would display an actual image in a real app */}
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Photo {index + 1}
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="aspect-square flex flex-col items-center justify-center gap-1"
            onClick={addPhoto}
          >
            <Camera className="h-8 w-8" />
            <span>Add Photo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}