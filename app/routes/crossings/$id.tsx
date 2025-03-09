import { Link, useParams } from "react-router";
import { ArrowLeft, Download, Edit, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { CrossingMap } from "~/components/crossingMap";

export default function CrossingDetailsPage() {
  const params = useParams();
  const id = params.id;

  // In a real app, you would fetch the crossing data based on the ID
  const crossing = {
    id: id,
    name: "Main Street Crossing",
    city: "Chicago",
    state: "IL",
    latitude: 41.8781,
    longitude: -87.6298,
    type: "Public",
    warningDevice: "Gates",
    lastUpdated: "2023-12-15",
    status: "Compliant",
    roadway: {
      name: "Main Street",
      type: "City Street",
      aadt: 12500,
      speedLimit: 35,
      lanes: 4,
    },
    railroad: {
      company: "Metra",
      subdivision: "North Line",
      trainCount: 48,
      maxSpeed: 79,
      tracks: 2,
    },
    fraData: {
      inventoryNumber: "123456A",
      reportingAgency: "Metra",
      lastSubmitted: "2023-12-01",
      apsRiskScore: 0.023,
      apsRiskCategory: "Low",
    },
    history: [
      {
        date: "2023-12-15",
        user: "John Doe",
        action: "Updated warning devices",
      },
      {
        date: "2023-10-20",
        user: "Jane Smith",
        action: "Field verification completed",
      },
      {
        date: "2023-08-05",
        user: "Mike Johnson",
        action: "Initial inventory created",
      },
    ],
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/crossings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{crossing.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge className="text-xs">ID: {crossing.id}</Badge>
              <Badge
                variant={
                  crossing.status === "Compliant"
                    ? "default"
                    : crossing.status === "Non-Compliant"
                      ? "destructive"
                      : "outline"
                }
              >
                {crossing.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export FRA Form
          </Button>
          <Button asChild className="hidden sm:flex">
            <Link to={`/crossings/${crossing.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Crossing
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="sm:hidden" asChild>
            <Link to={`/crossings/${crossing.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="fra-data">FRA Data</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Crossing Information</CardTitle>
                <CardDescription>Basic crossing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Name:</div>
                  <div className="text-sm">{crossing.name}</div>

                  <div className="text-sm font-medium">Location:</div>
                  <div className="text-sm">
                    {crossing.city}, {crossing.state}
                  </div>

                  <div className="text-sm font-medium">Type:</div>
                  <div className="text-sm">{crossing.type}</div>

                  <div className="text-sm font-medium">Warning Device:</div>
                  <div className="text-sm">{crossing.warningDevice}</div>

                  <div className="text-sm font-medium">Last Updated:</div>
                  <div className="text-sm">{crossing.lastUpdated}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Roadway Information</CardTitle>
                <CardDescription>Details about the roadway</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Road Name:</div>
                  <div className="text-sm">{crossing.roadway.name}</div>

                  <div className="text-sm font-medium">Road Type:</div>
                  <div className="text-sm">{crossing.roadway.type}</div>

                  <div className="text-sm font-medium">AADT:</div>
                  <div className="text-sm">{crossing.roadway.aadt.toLocaleString()} vehicles/day</div>

                  <div className="text-sm font-medium">Speed Limit:</div>
                  <div className="text-sm">{crossing.roadway.speedLimit} mph</div>

                  <div className="text-sm font-medium">Lanes:</div>
                  <div className="text-sm">{crossing.roadway.lanes}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Railroad Information</CardTitle>
                <CardDescription>Details about the railroad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Company:</div>
                  <div className="text-sm">{crossing.railroad.company}</div>

                  <div className="text-sm font-medium">Subdivision:</div>
                  <div className="text-sm">{crossing.railroad.subdivision}</div>

                  <div className="text-sm font-medium">Daily Trains:</div>
                  <div className="text-sm">{crossing.railroad.trainCount}</div>

                  <div className="text-sm font-medium">Max Speed:</div>
                  <div className="text-sm">{crossing.railroad.maxSpeed} mph</div>

                  <div className="text-sm font-medium">Tracks:</div>
                  <div className="text-sm">{crossing.railroad.tracks}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Geographic location of the crossing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm font-medium">Latitude</div>
                  <div className="text-sm md:text-base">{crossing.latitude}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Longitude</div>
                  <div className="text-sm md:text-base">{crossing.longitude}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">City</div>
                  <div className="text-sm md:text-base">{crossing.city}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">State</div>
                  <div className="text-sm md:text-base">{crossing.state}</div>
                </div>
              </div>

              <div className="h-[300px] sm:h-[400px] rounded-md border">
                <CrossingMap centerCoordinates={[crossing.longitude, crossing.latitude]} zoom={14} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fra-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FRA Data</CardTitle>
              <CardDescription>Federal Railroad Administration inventory data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium">FRA Inventory Number</div>
                  <div>{crossing.fraData.inventoryNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Reporting Agency</div>
                  <div>{crossing.fraData.reportingAgency}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Last Submitted</div>
                  <div>{crossing.fraData.lastSubmitted}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">APS Risk Score</div>
                  <div>{crossing.fraData.apsRiskScore}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">APS Risk Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Based on the FRA Accident Prediction and Severity (APS) model
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risk Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{crossing.fraData.apsRiskCategory}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Predicted Accident Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{crossing.fraData.apsRiskScore} accidents/year</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>Record of changes to this crossing inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {crossing.history.map((item, index) => (
                  <div className="flex items-center" key={index}>
                    <div className="mr-4 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        By {item.user} on {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile action buttons at bottom of screen */}
      <div className="fixed bottom-4 right-4 flex sm:hidden gap-2">
        <Button size="sm" variant="outline" className="rounded-full h-12 w-12 shadow-lg p-0 flex items-center justify-center">
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}