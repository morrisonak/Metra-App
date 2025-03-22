// ~/routes/crossings.tsx

import { useLoaderData } from "react-router";
import { db } from '~/lib/db';
import { railroadCrossings } from '~/db/schema';
import { desc,  } from 'drizzle-orm';

// Loader function that fetches the first 10 crossings
export async function loader() {
    try {
        const crossings = await db.select().from(railroadCrossings).orderBy(desc(railroadCrossings.revision_date)).limit(50);
        console.log('Crossings:', crossings);
        return { crossings, total: crossings.length, timestamp: new Date().toISOString() };
    } catch (error) {
        console.error('Error fetching crossings:', error);
        return { crossings: [], total: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Component that uses the loader data
export default function CrossingsOverview() {
    const { crossings, total, timestamp, error } = useLoaderData<typeof loader>();

    // Handle error state
    if (error) {
        return (
            <div className="p-4 border rounded bg-red-50 text-red-700">
                <h2 className="text-lg font-bold">Error Loading Data</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Crossings Overview</h1>
            <p className="mb-2">Total Crossings: {total}</p>
            <p className="mb-4">Data Retrieved At: {new Date(timestamp).toLocaleString()}</p>

            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">Crossing ID</th>
                        <th className="border border-gray-300 px-4 py-2">Revision Date</th>
                        <th className="border border-gray-300 px-4 py-2">Railroad Name</th>
                        <th className="border border-gray-300 px-4 py-2">City</th>
                        <th className="border border-gray-300 px-4 py-2">State</th>
                        <th className="border border-gray-300 px-4 py-2">Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {crossings.map((crossing, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 px-4 py-2">{crossing.crossing_id}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {new Date(crossing.revision_date).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{crossing.railroad_name}</td>
                            <td className="border border-gray-300 px-4 py-2">{crossing.city_name}</td>
                            <td className="border border-gray-300 px-4 py-2">{crossing.state_name}</td>
                            <td className="border border-gray-300 px-4 py-2">{crossing.reason_description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}