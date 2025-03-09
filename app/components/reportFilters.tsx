import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function ReportFilters() {
  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Report Filters</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="crossing-type">Crossing Type</Label>
            <Select>
              <SelectTrigger id="crossing-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="pedestrian">Pedestrian</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="warning-device">Warning Device</Label>
            <Select>
              <SelectTrigger id="warning-device">
                <SelectValue placeholder="All Devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="gates">Gates</SelectItem>
                <SelectItem value="flashers">Flashers</SelectItem>
                <SelectItem value="passive">Passive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="compliance-status">Compliance Status</Label>
            <Select>
              <SelectTrigger id="compliance-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Select>
              <SelectTrigger id="county">
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                <SelectItem value="cook">Cook</SelectItem>
                <SelectItem value="dupage">DuPage</SelectItem>
                <SelectItem value="lake">Lake</SelectItem>
                <SelectItem value="will">Will</SelectItem>
                <SelectItem value="kane">Kane</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="railroad">Railroad Company</Label>
            <Select>
              <SelectTrigger id="railroad">
                <SelectValue placeholder="All Railroads" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Railroads</SelectItem>
                <SelectItem value="metra">Metra</SelectItem>
                <SelectItem value="bnsf">BNSF Railway</SelectItem>
                <SelectItem value="up">Union Pacific</SelectItem>
                <SelectItem value="cn">Canadian National</SelectItem>
                <SelectItem value="cp">Canadian Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="risk-level">Risk Level</Label>
            <Select>
              <SelectTrigger id="risk-level">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline">Reset Filters</Button>
          <Button>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}