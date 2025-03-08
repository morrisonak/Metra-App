import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function EditCrossingPage() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  // In a real app, you would fetch the crossing data based on the ID
  const crossing = {
    id: id, // This is now the DOT number (e.g., 123456A)
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
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to={`/crossings/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Crossing</h2>
            <p className="text-muted-foreground">
              {crossing.name} (DOT: {crossing.id})
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crossing Edit Form</CardTitle>
          <CardDescription>Use this form to update crossing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>This page would contain a form to edit the crossing details.</p>
            <p>In the actual implementation, you would include the CrossingEditForm component here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate(`/crossings/${params.id}`)}>
                Cancel
              </Button>
              <Button onClick={() => navigate(`/crossings/${params.id}`)}>
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}