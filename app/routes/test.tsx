// app/routes/admin/seed-inspections.tsx
import { db } from "~/lib/db";
import { inspections, railroadCrossings } from "~/db/schema";
import { desc, asc, eq, or, ilike, sql } from "drizzle-orm";

// Inspector names
const managementInspectors = [
  'John Smith',
  'Sarah Johnson', 
  'Michael Brown',
  'Lisa Davis',
  'Robert Wilson'
];

const representedInspectors = [
  'James Anderson',
  'Mary Thompson',
  'David Garcia',
  'Jennifer Martinez',
  'Christopher Lee',
  'Patricia Rodriguez',
  'Daniel Lewis',
  'Linda Walker',
  'Mark Hall',
  'Barbara Allen',
  'Steven Young',
  'Susan King',
  'Kevin Wright',
  'Nancy Lopez',
  'Paul Hill'
];

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number in range
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to add days to date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper function to get day of week (0 = Sunday, 6 = Saturday)
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export async function seedInspections() {
  try {
    console.log('Starting inspection data seeding...');
    
    // Get a sample of crossing IDs to use for inspections
    const crossingIds = await db
      .select({ crossing_id: railroadCrossings.crossing_id })
      .from(railroadCrossings)
      .limit(100);
    
    if (crossingIds.length === 0) {
      throw new Error('No crossing IDs found. Please ensure railroad_crossings table has data.');
    }
    
    console.log(`Found ${crossingIds.length} crossings to use for inspections`);
    
    // Define date range: 90 days before May 31, 2025
    const endDate = new Date('2025-05-31');
    const startDate = new Date('2025-03-02'); // 90 days before
    
    const inspectionRecords: any[] = [];
    
    // Generate inspections for each day
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate = addDays(currentDate, 1)) {
      const dayOfWeek = getDayOfWeek(currentDate);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }
      
      // Calculate inspection counts based on day of week
      let mgmtCount: number;
      let repCount: number;
      
      if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday or Friday - lighter days
        mgmtCount = Math.random() < 0.3 ? 0 : getRandomInt(1, 6);
        repCount = Math.random() < 0.3 ? 0 : getRandomInt(2, 10);
      } else { // Tuesday-Thursday - regular days
        mgmtCount = getRandomInt(2, 8);
        repCount = getRandomInt(5, 15);
      }
      
      // Generate management inspections
      for (let i = 0; i < mgmtCount; i++) {
        const randomCrossing = getRandomItem(crossingIds);
        const randomInspector = getRandomItem(managementInspectors);
        
        // Create a random time during work hours (8 AM - 4 PM)
        const workStart = new Date(currentDate);
        workStart.setHours(8, 0, 0, 0);
        const workEnd = new Date(currentDate);
        workEnd.setHours(16, 0, 0, 0);
        
        const randomTime = new Date(workStart.getTime() + Math.random() * (workEnd.getTime() - workStart.getTime()));
        
        inspectionRecords.push({
          crossing_id: randomCrossing.crossing_id,
          inspection_date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
          staff_type: 'management',
          inspector_name: randomInspector,
          created_at: randomTime,
        });
      }
      
      // Generate represented inspections
      for (let i = 0; i < repCount; i++) {
        const randomCrossing = getRandomItem(crossingIds);
        const randomInspector = getRandomItem(representedInspectors);
        
        // Create a random time during work hours (8 AM - 4 PM)
        const workStart = new Date(currentDate);
        workStart.setHours(8, 0, 0, 0);
        const workEnd = new Date(currentDate);
        workEnd.setHours(16, 0, 0, 0);
        
        const randomTime = new Date(workStart.getTime() + Math.random() * (workEnd.getTime() - workStart.getTime()));
        
        inspectionRecords.push({
          crossing_id: randomCrossing.crossing_id,
          inspection_date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
          staff_type: 'represented',
          inspector_name: randomInspector,
          created_at: randomTime,
        });
      }
    }
    
    console.log(`Generated ${inspectionRecords.length} inspection records`);
    
    // Insert records in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < inspectionRecords.length; i += batchSize) {
      const batch = inspectionRecords.slice(i, i + batchSize);
      await db.insert(inspections).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(inspectionRecords.length / batchSize)}`);
    }
    
    // Get summary statistics
    const totalRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(inspections);
    
    const mgmtRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(inspections)
      .where(eq(inspections.staff_type, 'management'));
    
    const repRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(inspections)
      .where(eq(inspections.staff_type, 'represented'));
    
    console.log('Seeding completed successfully!');
    console.log(`Total records: ${totalRecords[0]?.count || 0}`);
    console.log(`Management inspections: ${mgmtRecords[0]?.count || 0}`);
    console.log(`Represented inspections: ${repRecords[0]?.count || 0}`);
    
    return {
      success: true,
      totalRecords: totalRecords[0]?.count || 0,
      managementRecords: mgmtRecords[0]?.count || 0,
      representedRecords: repRecords[0]?.count || 0,
    };
    
  } catch (error) {
    console.error('Error seeding inspection data:', error);
    throw error;
  }
}

// Or create a route to run the seeder (app/routes/admin/seed-inspections.tsx)


export async function action({ request }: Route.ActionArgs) {
  try {
    // Add some basic auth check here if needed
    const result = await seedInspections();
    return { success: true, ...result };
  } catch (error) {
    console.error('Seeding error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export default function SeedInspectionsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Seed Inspection Data</h1>
      <form method="post">
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Seed Inspection Data (90 days)
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        This will generate realistic inspection data for the last 90 days from May 31, 2025.
        Management: 0-8 inspections/day, Represented: 0-15 inspections/day.
        No inspections on weekends.
      </p>
    </div>
  );
}
