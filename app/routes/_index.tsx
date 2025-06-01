// app/routes/_index.tsx
import { useLoaderData } from "react-router";
import { SectionCards } from "~/components/section-cards";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { InspectionDataTable } from "~/components/data-table";
import { db } from "~/lib/db";
import { inspections } from "~/db/schema";
import { sql } from "drizzle-orm";

// Loader function to fetch inspection data for the chart
export async function loader() {
  try {
    // Calculate date ranges relative to today
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Query to get inspection counts by date and staff type for the chart
    const chartDataQuery = await db.execute(sql`
      SELECT 
        DATE(i.inspection_date) as date,
        i.staff_type,
        COUNT(*) as count
      FROM inspections i
      WHERE i.inspection_date >= ${ninetyDaysAgo.toISOString().split('T')[0]}
        AND i.inspection_date <= ${today.toISOString().split('T')[0]}
      GROUP BY DATE(i.inspection_date), i.staff_type
      ORDER BY date ASC
    `);

    // Query to get recent inspection data for the table
    const inspectionData = await db.execute(sql`
      SELECT 
        i.id,
        i.crossing_id,
        i.inspection_date,
        i.staff_type,
        i.inspector_name,
        i.created_at,
        COALESCE(rc.street, rc.highway_name, 'Unnamed') as crossing_name,
        rc.city_name as city,
        rc.state_name as state
      FROM inspections i
      LEFT JOIN railroad_crossings rc ON i.crossing_id = rc.crossing_id
      ORDER BY i.inspection_date DESC
      LIMIT 50
    `);

    // Get total inspections count for the last 90 days
    const totalInspectionsQuery = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM inspections 
      WHERE inspection_date >= ${ninetyDaysAgo.toISOString().split('T')[0]}
        AND inspection_date <= ${today.toISOString().split('T')[0]}
    `);

    // Get this month's inspections
    const thisMonthInspectionsQuery = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM inspections 
      WHERE inspection_date >= ${thisMonthStart.toISOString().split('T')[0]}
        AND inspection_date <= ${today.toISOString().split('T')[0]}
    `);

    // Get last month's inspections for comparison
    const lastMonthInspectionsQuery = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM inspections 
      WHERE inspection_date >= ${lastMonthStart.toISOString().split('T')[0]}
        AND inspection_date <= ${lastMonthEnd.toISOString().split('T')[0]}
    `);

    // Get pending inspections count (recent inspections within 30 days that might need follow-up)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const pendingInspectionsQuery = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM inspections 
      WHERE inspection_date >= ${thirtyDaysAgo.toISOString().split('T')[0]}
        AND inspection_date <= ${today.toISOString().split('T')[0]}
    `);

    // Calculate inspection completion rate (as a proxy for "error rate")
    // This calculates the percentage of crossings that have been inspected recently
    const inspectionCompletionQuery = await db.execute(sql`
      SELECT 
        (SELECT COUNT(DISTINCT crossing_id) FROM inspections 
         WHERE inspection_date >= ${thisMonthStart.toISOString().split('T')[0]}
           AND inspection_date <= ${today.toISOString().split('T')[0]}) as inspected_crossings,
        (SELECT COUNT(*) FROM railroad_crossings) as total_crossings
    `);

    // Process chart data - create a complete date range with zero values
    const dateCountMap = new Map();
    
    // Initialize all dates in the range with zero values
    const currentDate = new Date(ninetyDaysAgo);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateCountMap.set(dateStr, { 
        date: dateStr, 
        management: 0, // Management inspections
        represented: 0   // Represented staff inspections
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in actual data from the query results
    chartDataQuery.rows.forEach((row: any) => {
      const dateStr = row.date;
      const staffType = row.staff_type?.toLowerCase() || '';
      const count = Number(row.count || 0);
      
      if (dateCountMap.has(dateStr)) {
        const existingData = dateCountMap.get(dateStr);
        
        // Map staff types to chart categories based on your schema
        if (staffType === 'management') {
          existingData.management += count;
        } else if (staffType === 'represented') {
          existingData.represented += count;
        }
      }
    });

    // Convert map to array for the chart component
    const chartData = Array.from(dateCountMap.values());

    // Extract values from query results
    const totalInspections = Number(totalInspectionsQuery.rows[0]?.total || 0);
    const thisMonthInspections = Number(thisMonthInspectionsQuery.rows[0]?.total || 0);
    const lastMonthInspections = Number(lastMonthInspectionsQuery.rows[0]?.total || 0);
    const pendingInspections = Number(pendingInspectionsQuery.rows[0]?.total || 0);
    
    // Calculate growth percentage
    const growthPercentage = lastMonthInspections > 0 
      ? Number(((thisMonthInspections - lastMonthInspections) / lastMonthInspections * 100).toFixed(1))
      : 0;

    // Calculate completion rate (percentage of crossings inspected this month)
    const completionData = inspectionCompletionQuery.rows[0];
    const inspectedCrossings = Number(completionData?.inspected_crossings || 0);
    const totalCrossings = Number(completionData?.total_crossings || 1);
    const completionRate = Number((inspectedCrossings / totalCrossings * 100).toFixed(1));

    console.log('Dashboard data loaded successfully:', {
      chartDataPoints: chartData,
      inspectionRecords: inspectionData.rows.length,
      totalInspections,
      thisMonthInspections,
      growthPercentage,
      pendingInspections,
      completionRate
    });

    return { 
      chartData,
      inspectionData: inspectionData.rows, 
      dashboardStats: {
        totalInspections,
        thisMonthInspections,
        growthPercentage,
        pendingCount: pendingInspections,
        errorRate: 100 - completionRate // Convert completion rate to "error/incomplete" rate
      },
      success: true,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    return { 
      chartData: [],
      inspectionData: [], 
      dashboardStats: {
        totalInspections: 0,
        thisMonthInspections: 0,
        growthPercentage: 0,
        pendingCount: 0,
        errorRate: 0
      },
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while loading dashboard data'
    };
  }
}

export default function DashboardPage() {
  const loaderData = useLoaderData<typeof loader>();
  
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards dashboardStats={loaderData.dashboardStats} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive 
          chartData={loaderData.chartData} 
          success={loaderData.success} 
          error={loaderData.error} 
          lastUpdated={loaderData.lastUpdated} 
        />
      </div>
      <InspectionDataTable data={loaderData.inspectionData} />
    </div>
  );
}