import { useState } from "react";
import { ArrowDownUp, CheckCircle, Clock, Download, Upload, XCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function SyncPage() {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleStartSync = () => {
    setSyncInProgress(true);
    setSyncProgress(0);

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSyncInProgress(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">FRA GCIS Sync</h2>
          <p className="text-muted-foreground">Synchronize data with FRA Crossing Interface Systems</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={syncInProgress}>
            <Download className="mr-2 h-4 w-4" />
            Import from FRA
          </Button>
          <Button disabled={syncInProgress} onClick={handleStartSync}>
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Sync Now
          </Button>
        </div>
      </div>

      {syncInProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Sync in Progress</CardTitle>
            <CardDescription>Synchronizing data with FRA GCIS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div>Progress</div>
                <div>{syncProgress}%</div>
              </div>
              <Progress value={syncProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Sync History</TabsTrigger>
          <TabsTrigger value="pending">Pending Changes</TabsTrigger>
          <TabsTrigger value="settings">Sync Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent synchronization activities with FRA GCIS</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-02-15 09:30 AM</TableCell>
                    <TableCell>Full Sync</TableCell>
                    <TableCell>1,248</TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex w-fit items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Log
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-02-10 02:15 PM</TableCell>
                    <TableCell>Incremental</TableCell>
                    <TableCell>23</TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex w-fit items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Log
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-02-05 10:45 AM</TableCell>
                    <TableCell>Import</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="flex w-fit items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Failed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Log
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-02-01 08:00 AM</TableCell>
                    <TableCell>Full Sync</TableCell>
                    <TableCell>1,245</TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex w-fit items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Log
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Changes</CardTitle>
              <CardDescription>Changes waiting to be synchronized with FRA GCIS</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crossing ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>123456</TableCell>
                    <TableCell>Main Street Crossing</TableCell>
                    <TableCell>Update</TableCell>
                    <TableCell>2024-02-14</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Push
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>789012</TableCell>
                    <TableCell>Oak Avenue Crossing</TableCell>
                    <TableCell>Update</TableCell>
                    <TableCell>2024-02-13</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Push
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>NEW001</TableCell>
                    <TableCell>Industrial Park Access</TableCell>
                    <TableCell>New</TableCell>
                    <TableCell>2024-02-12</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Push
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                <Upload className="mr-2 h-4 w-4" />
                Push All Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>Configure synchronization settings with FRA GCIS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sync Schedule</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sync Time</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midnight">12:00 AM</SelectItem>
                      <SelectItem value="morning">6:00 AM</SelectItem>
                      <SelectItem value="noon">12:00 PM</SelectItem>
                      <SelectItem value="evening">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">FRA GCIS API Endpoint</h3>
                  <Input placeholder="https://api.fra.dot.gov/GCIS" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">API Key</h3>
                  <Input type="password" placeholder="••••••••••••••••" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="mr-2">
                Reset
              </Button>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}