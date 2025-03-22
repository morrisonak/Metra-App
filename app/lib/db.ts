// ~/lib/db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '~/db/schema';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

// Get the database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a SQL query executor
const sql = neon(connectionString);

// Create a Drizzle ORM instance
export const db = drizzle(sql, { schema });

// Optional: Add a helper function to check the database connection
export async function checkDatabaseConnection() {
  try {
    // Try to execute a simple query
    const result = await sql`SELECT 1 as connected`;
    return { connected: result[0]?.connected === 1, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database connection error:', error);
    return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Re-export schema for convenience
export * from '~/db/schema';