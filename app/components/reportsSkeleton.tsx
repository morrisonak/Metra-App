import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <Card key={i} className="col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-[250px] w-[250px] rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <Card key={i} className="col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="flex h-full flex-col justify-between">
                  {Array(5)
                    .fill(null)
                    .map((_, j) => (
                      <Skeleton
                        key={j}
                        className="h-10 w-full"
                        style={{ width: `${Math.random() * 50 + 50}%` }}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}