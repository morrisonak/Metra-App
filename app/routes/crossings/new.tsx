import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function NewCrossingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/crossings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inspections</h2>
            <p className="text-muted-foreground">Create a new Grade Crossing Inspection</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crossing Information</CardTitle>
          <CardDescription>Enter the basic information for the new crossing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>This page would contain a form to add a new crossing.</p>
            <p>In the actual implementation, you would include the CrossingEditForm component here with empty initial values.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/crossings")}>
                Cancel
              </Button>
              <Button onClick={() => navigate("/crossings")}>
                Create Crossing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}