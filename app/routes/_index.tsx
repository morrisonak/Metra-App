// app/routes/_index.tsx
import { useLoaderData } from "react-router";
import { SectionCards } from "~/components/section-cards";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { InspectionDataTable } from "~/components/data-table";
import { db } from "~/lib/db";
import { inspections } from "~/db/schema";
import { sql } from "drizzle-orm";

// Type definitions for better type safety
export interface DashboardData {
  chartData: ChartDataPoint[];
  inspectionData: InspectionDataPoint[];
  dashboardStats: DashboardStats;
  success: boolean;
  error?: string;
  lastUpdated: string;
  metadata: {
    dateRange: {
      start: string;
      end: string;
    };
    queryExecutionTime: number;
  };
}

interface ChartDataPoint {
  date: string;
  management: number;
  represented: number;
}

interface InspectionDataPoint {
  id: number;
  crossing_id: string;
  crossing_name: string;
  city: string;
  state: string;
  inspection_date: string;
  staff_type: string;
  inspector_name: string;
  status: string;
  priority: string;
}

interface DashboardStats {
  totalInspections: number;
  thisMonthInspections: number;
  growthPercentage: number;
  pendingCount: number;
  errorRate: number;
}

/**
 * Generates chart data with complete date range and proper data structure
 */
function generateChartData(queryRows: any[], startDate: string, endDate: string): ChartDataPoint[] {
  // Create a map for quick lookups
  const dataMap = new Map<string, { management: number; represented: number }>();
  
  // Initialize all dates in the range
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    dataMap.set(dateStr, { management: 0, represented: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Fill in actual data
  queryRows.forEach((row: any) => {
    const dateStr = row.date;
    const staffType = row.staff_type?.toLowerCase() || '';
    const count = Number(row.count || 0);
    
    const existing = dataMap.get(dateStr);
    if (existing) {
      if (staffType === 'management') {
        existing.management += count;
      } else if (staffType === 'represented') {
        existing.represented += count;
      }
    }
  });

  // Convert to array format for the chart
  return Array.from(dataMap.entries()).map(([date, counts]) => ({
    date,
    management: counts.management,
    represented: counts.represented
  }));
}

/**
 * Loader function to fetch all dashboard data
 * Optimized for performance with parallel queries and comprehensive error handling
 */
export async function loader(): Promise<DashboardData> {
  const startTime = Date.now();
  
  try {
    // Calculate date ranges relative to today
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Format dates for SQL queries
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const dates = {
      today: formatDate(today),
      ninetyDaysAgo: formatDate(ninetyDaysAgo),
      thisMonthStart: formatDate(thisMonthStart),
      lastMonthStart: formatDate(lastMonthStart),
      lastMonthEnd: formatDate(lastMonthEnd),
      thirtyDaysAgo: formatDate(thirtyDaysAgo),
    };

    // Execute all queries in parallel for better performance
    const [
      chartDataResult,
      inspectionDataResult,
      dashboardStatsResult
    ] = await Promise.all([
      // Chart data query - get inspection counts by date and staff type
      db.execute(sql`
        SELECT 
          DATE(i.inspection_date) as date,
          i.staff_type,
          COUNT(*) as count
        FROM inspections i
        WHERE i.inspection_date >= ${dates.ninetyDaysAgo}
          AND i.inspection_date <= ${dates.today}
        GROUP BY DATE(i.inspection_date), i.staff_type
        ORDER BY date ASC
      `),

      // Recent inspection data for the table with enhanced fields
      db.execute(sql`
        SELECT 
          i.id,
          i.crossing_id,
          i.inspection_date,
          i.staff_type,
          i.inspector_name,
          i.created_at,
          COALESCE(rc.street, rc.highway_name, 'Unnamed') as crossing_name,
          rc.city_name as city,
          rc.state_name as state,
          -- Add status based on inspection date
          CASE 
            WHEN i.inspection_date = CURRENT_DATE THEN 'In Progress'
            WHEN i.inspection_date < CURRENT_DATE THEN 'Completed'
            ELSE 'Pending'
          END as status,
          -- Add priority based on how recent the inspection is (fix: use proper date arithmetic)
          CASE 
            WHEN (CURRENT_DATE - i.inspection_date) <= 7 THEN 'High'
            WHEN (CURRENT_DATE - i.inspection_date) <= 30 THEN 'Medium'
            ELSE 'Low'
          END as priority
        FROM inspections i
        LEFT JOIN railroad_crossings rc ON i.crossing_id = rc.crossing_id
        ORDER BY i.inspection_date DESC, i.created_at DESC
        LIMIT 50
      `),

      // Single comprehensive query for all dashboard statistics
      db.execute(sql`
        WITH inspection_counts AS (
          SELECT 
            COUNT(*) FILTER (WHERE inspection_date >= ${dates.ninetyDaysAgo} AND inspection_date <= ${dates.today}) as total_90_days,
            COUNT(*) FILTER (WHERE inspection_date >= ${dates.thisMonthStart} AND inspection_date <= ${dates.today}) as this_month,
            COUNT(*) FILTER (WHERE inspection_date >= ${dates.lastMonthStart} AND inspection_date <= ${dates.lastMonthEnd}) as last_month,
            COUNT(*) FILTER (WHERE inspection_date >= ${dates.thirtyDaysAgo} AND inspection_date <= ${dates.today}) as last_30_days,
            COUNT(DISTINCT crossing_id) FILTER (WHERE inspection_date >= ${dates.thisMonthStart} AND inspection_date <= ${dates.today}) as unique_crossings_this_month
          FROM inspections
        ),
        crossing_counts AS (
          SELECT COUNT(*) as total_crossings
          FROM railroad_crossings
        )
        SELECT 
          ic.total_90_days,
          ic.this_month,
          ic.last_month,
          ic.last_30_days,
          ic.unique_crossings_this_month,
          cc.total_crossings,
          -- Calculate completion rate (percentage of crossings inspected this month)
          CASE 
            WHEN cc.total_crossings > 0 
            THEN ROUND((ic.unique_crossings_this_month::decimal / cc.total_crossings * 100), 1)
            ELSE 0 
          END as completion_rate,
          -- Calculate growth percentage (month over month)
          CASE 
            WHEN ic.last_month > 0 
            THEN ROUND(((ic.this_month - ic.last_month)::decimal / ic.last_month * 100), 1)
            ELSE 0 
          END as growth_percentage
        FROM inspection_counts ic, crossing_counts cc
      `)
    ]);

    // Process dashboard statistics from the comprehensive query
    const statsRow = dashboardStatsResult.rows[0];
    const dashboardStats: DashboardStats = {
      totalInspections: Number(statsRow?.total_90_days || 0),
      thisMonthInspections: Number(statsRow?.this_month || 0),
      growthPercentage: Number(statsRow?.growth_percentage || 0),
      pendingCount: Number(statsRow?.last_30_days || 0),
      errorRate: Number((100 - (statsRow?.completion_rate || 0)).toFixed(1))
    };

    // Process chart data with complete date range
    const chartData = generateChartData(chartDataResult.rows, dates.ninetyDaysAgo, dates.today);

    // Process inspection data with proper typing and validation
    const inspectionData: InspectionDataPoint[] = inspectionDataResult.rows.map((row: any) => ({
      id: Number(row.id),
      crossing_id: String(row.crossing_id),
      crossing_name: String(row.crossing_name || 'Unnamed'),
      city: String(row.city || ''),
      state: String(row.state || ''),
      inspection_date: String(row.inspection_date),
      staff_type: String(row.staff_type),
      inspector_name: String(row.inspector_name),
      status: String(row.status || 'Pending'),
      priority: String(row.priority || 'Medium')
    }));

    const executionTime = Date.now() - startTime;

    console.log('Dashboard data loaded successfully:', {
      chartDataPoints: chartData.length,
      inspectionRecords: inspectionData.length,
      executionTime: `${executionTime}ms`,
      ...dashboardStats
    });

    return { 
      chartData,
      inspectionData,
      dashboardStats,
      success: true,
      lastUpdated: new Date().toISOString(),
      metadata: {
        dateRange: {
          start: dates.ninetyDaysAgo,
          end: dates.today
        },
        queryExecutionTime: executionTime
      }
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('Error fetching dashboard data:', error);
    
    // Return safe fallback data with proper error information
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
      error: error instanceof Error ? error.message : 'Unknown error occurred while loading dashboard data',
      lastUpdated: new Date().toISOString(),
      metadata: {
        dateRange: {
          start: '',
          end: ''
        },
        queryExecutionTime: executionTime
      }
    };
  }
}

/**
 * Dashboard page component
 * Displays overview cards, interactive chart, and recent inspections table
 */
export default function DashboardPage() {
  const loaderData = useLoaderData<typeof loader>();
  
  // Show error state if data loading failed
  if (!loaderData.success) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <h2 className="text-lg font-semibold text-destructive">Dashboard Error</h2>
            <p className="text-sm text-destructive/80 mt-1">
              {loaderData.error || 'Failed to load dashboard data'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 text-sm bg-destructive text-destructive-foreground px-3 py-1 rounded hover:bg-destructive/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Dashboard Statistics Cards */}
      <SectionCards dashboardStats={loaderData.dashboardStats} />
      
      {/* Interactive Chart */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive 
          chartData={loaderData.chartData} 
          success={loaderData.success} 
          error={loaderData.error} 
          lastUpdated={loaderData.lastUpdated} 
        />
      </div>
      
      {/* Recent Inspections Table */}
      <InspectionDataTable data={loaderData.inspectionData} />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 lg:px-6">
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              Debug Info (Execution: {loaderData.metadata.queryExecutionTime}ms)
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(loaderData.metadata, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}