import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function SettingsPage() {
  const [formState, setFormState] = useState({
    organizationName: "Metra",
    contactEmail: "admin@metrarr.com",
    apiEndpoint: "https://api.fra.dot.gov/GCIS",
    apiKey: "••••••••••••••••",
    autoSync: true,
    syncFrequency: "daily",
    offlineMode: true,
    maxOfflineStorage: "500",
    defaultMapZoom: "12",
    defaultMapCenter: "41.8781,-87.6298",
    theme: "system",
    dateFormat: "MM/DD/YYYY",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="fra-integration">FRA Integration</TabsTrigger>
          <TabsTrigger value="offline">Offline Mode</TabsTrigger>
          <TabsTrigger value="map">Map Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="organization-name">Organization Name</Label>
                <Input
                  id="organization-name"
                  value={formState.organizationName}
                  onChange={(e) => handleChange("organizationName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formState.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={formState.dateFormat} onValueChange={(value) => handleChange("dateFormat", value)}>
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fra-integration" className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">FRA GCIS API Endpoint</Label>
                <Input
                  id="api-endpoint"
                  value={formState.apiEndpoint}
                  onChange={(e) => handleChange("apiEndpoint", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={formState.apiKey}
                  onChange={(e) => handleChange("apiKey", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-sync"
                  checked={formState.autoSync}
                  onCheckedChange={(checked) => handleChange("autoSync", checked)}
                />
                <Label htmlFor="auto-sync">Enable Automatic Synchronization</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select
                  value={formState.syncFrequency}
                  onValueChange={(value) => handleChange("syncFrequency", value)}
                  disabled={!formState.autoSync}
                >
                  <SelectTrigger id="sync-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="offline-mode"
                  checked={formState.offlineMode}
                  onCheckedChange={(checked) => handleChange("offlineMode", checked)}
                />
                <Label htmlFor="offline-mode">Enable Offline Mode</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-storage">Maximum Offline Storage (MB)</Label>
                <Input
                  id="max-storage"
                  type="number"
                  value={formState.maxOfflineStorage}
                  onChange={(e) => handleChange("maxOfflineStorage", e.target.value)}
                  disabled={!formState.offlineMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Offline Data Priorities</Label>
                <div className="rounded-md border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="priority-crossings" defaultChecked />
                      <Label htmlFor="priority-crossings">Crossing Basic Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="priority-photos" defaultChecked />
                      <Label htmlFor="priority-photos">Recent Photos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="priority-maps" defaultChecked />
                      <Label htmlFor="priority-maps">Map Tiles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="priority-history" />
                      <Label htmlFor="priority-history">Change History</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="default-zoom">Default Zoom Level</Label>
                <Input
                  id="default-zoom"
                  type="number"
                  min="1"
                  max="20"
                  value={formState.defaultMapZoom}
                  onChange={(e) => handleChange("defaultMapZoom", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-center">Default Map Center (Lat,Lng)</Label>
                <Input
                  id="default-center"
                  value={formState.defaultMapCenter}
                  onChange={(e) => handleChange("defaultMapCenter", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Map Layers</Label>
                <div className="rounded-md border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="layer-satellite" defaultChecked />
                      <Label htmlFor="layer-satellite">Satellite Imagery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="layer-terrain" defaultChecked />
                      <Label htmlFor="layer-terrain">Terrain</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="layer-railroad" defaultChecked />
                      <Label htmlFor="layer-railroad">Railroad Tracks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="layer-roads" defaultChecked />
                      <Label htmlFor="layer-roads">Roads</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={formState.theme} onValueChange={(value) => handleChange("theme", value)}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  placeholder="Enter custom CSS rules"
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button className="mt-2">
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
}