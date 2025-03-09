import { Suspense } from "react";
import { Download, Filter } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DateRangePicker } from "~/components/dateRangePicker";
import { ReportsSkeleton } from "~/components/reportsSkeleton";
import { CrossingTypeChart } from "~/components/crossingTypeChart";
import { WarningDeviceChart } from "~/components/warningDeviceChart";
import { ComplianceRateChart } from "~/components/complianceRateChart";
import { CrossingsByCountyChart } from "~/components/crossingByCountyChart";
import { InspectionTrendChart } from "~/components/inspectionTrendChart";
import { RiskAssessmentChart } from "~/components/riskAssessmentChart";
import { MetricsCards } from "~/components/metricsCards";
import { ReportFilters } from "~/components/reportFilters";

export default function ReportsPage() {
  return (  
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Analyze crossing data and generate reports for compliance and planning
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangePicker />
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<ReportsSkeleton />}>
            <MetricsCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Crossing Types</CardTitle>
                  <CardDescription>Distribution of crossing types</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <CrossingTypeChart />
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Warning Devices</CardTitle>
                  <CardDescription>Distribution of warning device types</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <WarningDeviceChart />
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Distribution by risk category</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <RiskAssessmentChart />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Crossings by County</CardTitle>
                  <CardDescription>Number of crossings per county</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <CrossingsByCountyChart />
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Compliance Rate Trend</CardTitle>
                  <CardDescription>Monthly compliance rate over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ComplianceRateChart />
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ReportFilters />
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Current compliance status of all crossings</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ComplianceRateChart detailed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <ReportFilters />
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>FRA Accident Prediction and Severity (APS) model results</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <RiskAssessmentChart detailed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <ReportFilters />
          <Card>
            <CardHeader>
              <CardTitle>Inspection Trends</CardTitle>
              <CardDescription>Inspection activity over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <InspectionTrendChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create custom reports with selected metrics and filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Report Type</h3>
                    <select className="w-full rounded-md border p-2">
                      <option>Crossing Inventory</option>
                      <option>Compliance Status</option>
                      <option>Risk Assessment</option>
                      <option>Inspection History</option>
                      <option>Warning Device Analysis</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Format</h3>
                    <select className="w-full rounded-md border p-2">
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                      <option>JSON</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Included Fields</h3>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-id" className="rounded border" defaultChecked />
                      <label htmlFor="field-id">DOT Number</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-name" className="rounded border" defaultChecked />
                      <label htmlFor="field-name">Crossing Name</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-location" className="rounded border" defaultChecked />
                      <label htmlFor="field-location">Location</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-type" className="rounded border" defaultChecked />
                      <label htmlFor="field-type">Crossing Type</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-warning" className="rounded border" defaultChecked />
                      <label htmlFor="field-warning">Warning Device</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-compliance" className="rounded border" defaultChecked />
                      <label htmlFor="field-compliance">Compliance Status</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-risk" className="rounded border" defaultChecked />
                      <label htmlFor="field-risk">Risk Score</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-railroad" className="rounded border" />
                      <label htmlFor="field-railroad">Railroad Company</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-road" className="rounded border" />
                      <label htmlFor="field-road">Road Name</label>
                    </div>
                  </div>
                </div>

                <Button className="w-full sm:w-auto">Generate Custom Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}