import { useState } from "react";
import { Save, Upload, WifiOff } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import { CrossingFieldForm } from "~/components/crossingFieldForm";

export default function FieldCollectionPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingUploads, setPendingUploads] = useState(3);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Field Data Collection</h2>
          <p className="text-muted-foreground">Collect crossing data in the field with offline support</p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Button variant="outline" className="gap-2">
              <WifiOff className="h-4 w-4" />
              Offline Mode
            </Button>
          )}
          {pendingUploads > 0 && (
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Sync ({pendingUploads})
            </Button>
          )}
        </div>
      </div>

      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are working offline</AlertTitle>
          <AlertDescription>Your changes will be saved locally and synchronized when you reconnect.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Collection</TabsTrigger>
          <TabsTrigger value="pending">Pending Uploads ({pendingUploads})</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crossing Field Data Collection</CardTitle>
              <CardDescription>Complete the form below to collect field data for a railway crossing</CardDescription>
            </CardHeader>
            <CardContent>
              <CrossingFieldForm />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Clear Form</Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Collection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Uploads</CardTitle>
              <CardDescription>Field data collections waiting to be synchronized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Main Street Crossing</h3>
                      <p className="text-sm text-muted-foreground">Collected on 2024-02-15 10:30 AM</p>
                    </div>
                    <Button size="sm">Upload</Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Oak Avenue Crossing</h3>
                      <p className="text-sm text-muted-foreground">Collected on 2024-02-14 2:15 PM</p>
                    </div>
                    <Button size="sm">Upload</Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Industrial Park Access</h3>
                      <p className="text-sm text-muted-foreground">Collected on 2024-02-13 9:45 AM</p>
                    </div>
                    <Button size="sm">Upload</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload All Pending Collections
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}