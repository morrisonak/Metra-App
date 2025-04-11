// app/routes/crossings/_index.tsx
import { useState } from "react";
import { useLoaderData } from "react-router";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { RailroadCrossingsTable } from "~/components/crossingDataTable";
import { db } from "~/lib/db";
import { railroadCrossings } from "~/db/schema";
import { desc, asc, eq, or, ilike, sql } from "drizzle-orm";

// Loader function to fetch crossing data with pagination and sorting
export async function loader({ request }) {
  try {
    // Get URL parameters for pagination and sorting
    const url = new URL(request.url);
    const pageIndex = parseInt(url.searchParams.get("page") || "0");
    const pageSize = parseInt(url.searchParams.get("size") || "10");
    const sortField = url.searchParams.get("sort") || "revision_date";
    const sortDirection = url.searchParams.get("order") || "desc";

    // Get search/filter parameters if present
    const searchTerm = url.searchParams.get("search") || "";
    const typeFilter = url.searchParams.get("type") || "all";
    const statusFilter = url.searchParams.get("status") || "all";

    // Calculate offset for pagination
    const offset = pageIndex * pageSize;

    // Build query for filtered results
    let query = db.select().from(railroadCrossings);

    // Add search filter if present
    if (searchTerm) {
      query = query.where(
        or(
          ilike(railroadCrossings.crossing_id, `%${searchTerm}%`),
          ilike(railroadCrossings.street || "", `%${searchTerm}%`),
          ilike(railroadCrossings.highway_name || "", `%${searchTerm}%`),
          ilike(railroadCrossings.city_name || "", `%${searchTerm}%`),
          ilike(railroadCrossings.state_name || "", `%${searchTerm}%`)
        )
      );
    }

    // Add type filter if present and not 'all'
    if (typeFilter && typeFilter !== "all") {
      query = query.where(
        ilike(railroadCrossings.crossing_type || "", `%${typeFilter}%`)
      );
    }

    // Add status filter if present and not 'all'
    if (statusFilter && statusFilter !== "all") {
      // Map the status names to DB values
      let statusValue = "";
      if (statusFilter === "Compliant") statusValue = "active";
      else if (statusFilter === "Non-Compliant") statusValue = "inactive";
      else if (statusFilter === "Pending Review") statusValue = "pending";

      if (statusValue) {
        query = query.where(
          ilike(railroadCrossings.report_status || "", `%${statusValue}%`)
        );
      }
    }

    // Get total count with the filters applied
    const totalCountQuery = `SELECT COUNT(*) FROM railroad_crossings`;
    const totalCountResult = await db.execute(sql.raw(totalCountQuery));

    // Access the count value safely with a fallback
    const totalCount = Number(totalCountResult.rows?.[0]?.count || 0);

    // Add pagination and sorting
    let sortExpression;
    if (sortField in railroadCrossings) {
      sortExpression =
        sortDirection === "desc"
          ? desc(railroadCrossings[sortField as keyof typeof railroadCrossings])
          : asc(railroadCrossings[sortField as keyof typeof railroadCrossings]);
    } else {
      // Default to revision_date if the field is invalid
      sortExpression = desc(railroadCrossings.revision_date);
    }

    const crossings = await query
      .limit(pageSize)
      .offset(offset)
      .orderBy(sortExpression);
    console.log("Crossings:", crossings[0].report_status);
    return {
      crossings,
      totalCount,
      pageIndex,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize),
      success: true,
    };
  } catch (error) {
    console.error("Error fetching crossings:", error);
    return {
      crossings: [],
      totalCount: 0,
      pageIndex: 0,
      pageSize: 10,
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Crossings page component that uses the data from the loader
export default function CrossingsPage() {
  const {
    crossings,
    success,
    error,
    totalCount,
    pageIndex,
    pageSize,
    pageCount,
  } = useLoaderData<typeof loader>();

  // If loading failed, show error
  if (!success) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <h2 className="text-lg font-bold">Error Loading Crossings</h2>
          <p>
            {error || "An unknown error occurred while loading crossing data."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crossings</h2>
          <p className="text-muted-foreground">
            Manage Railroad crossing inventory data
          </p>
        </div>
      </div>

      <RailroadCrossingsTable
        data={crossings}
        pagination={{
          pageIndex,
          pageSize,
          pageCount,
          onPageChange: (page) => {
            // Update URL with new page number
            const url = new URL(window.location.href);
            url.searchParams.set("page", page.toString());
            window.history.pushState({}, "", url.toString());
            // Reload the page with the new URL
            window.location.reload();
          },
          onPageSizeChange: (size) => {
            // Update URL with new page size
            const url = new URL(window.location.href);
            url.searchParams.set("size", size.toString());
            url.searchParams.set("page", "0"); // Reset to first page
            window.history.pushState({}, "", url.toString());
            // Reload the page with the new URL
            window.location.reload();
          },
        }}
      />
    </div>
  );
}
