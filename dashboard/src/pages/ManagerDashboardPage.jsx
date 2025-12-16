import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

// --- Helper component for statistic cards ---
function StatCard({ title, value, colorVar }) {
    return (
        <div 
            className="p-5 rounded-xl shadow-lg flex flex-col justify-between h-32"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
            <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
            {/* Use the color variable for the main value */}
            <p 
                className="text-3xl font-bold mt-2 truncate"
                style={{ color: `var(${colorVar})` }}
            >
                {value}
            </p>
        </div>
    );
}

export default function ManagerDashboardPage() { // Component name corrected
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        bestSeller: 'N/A',
        lastArchived: 'N/A'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [archiveMessage, setArchiveMessage] = useState("");

    // 1. Fetch sales statistics for the current period (MOCK IMPLEMENTATION)
    const fetchSalesStats = async () => {
        try {
            setLoading(true);
            setError("");
            
            // --- Replace with your actual API call ---
            // const res = await fetch(`${API_BASE}/sales/dashboard`);
            // if (!res.ok) throw new Error("Failed to load sales stats");
            // const data = await res.json();
            // setStats(data);
            
            // Mock Data for testing the UI without a server connection:
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setStats({
                totalRevenue: 1245.50,
                totalTransactions: 87,
                bestSeller: 'Double Cheeseburger',
                lastArchived: '2024-05-15'
            });

        } catch (err) {
            console.error(err);
            setError(err.message || "Error fetching sales data.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Archive sales data and reset for a new period (MOCK IMPLEMENTATION)
    const handleArchiveAndReset = async () => {
        if (!window.confirm("Are you sure you want to archive today's sales and reset the counter? This cannot be undone.")) {
            return;
        }

        try {
            setArchiveMessage("Archiving and resetting...");
            setError("");
            
            // --- Replace with your actual API call ---
            // const res = await fetch(`${API_BASE}/sales/archive-and-reset`, { method: "POST" });
            // if (!res.ok) throw new Error("Failed to archive and reset sales.");
            // const data = await res.json(); 
            
            // Mock Success:
            await new Promise(resolve => setTimeout(resolve, 500)); 
            const mockedArchivedTotal = stats.totalRevenue; // Use current revenue for mock

            setArchiveMessage(`Successfully archived sales of $${mockedArchivedTotal.toFixed(2)}. Counter reset.`);
            fetchSalesStats(); // Refresh the stats to show zeros

        } catch (err) {
            console.error(err);
            setArchiveMessage("");
            setError(err.message || "Error during archive/reset process.");
        }
    };

    useEffect(() => {
        fetchSalesStats();
    }, []);

    const formattedRevenue = `$${stats.totalRevenue.toFixed(2)}`;

    return (
        <div 
            className="p-4 sm:p-8 min-h-screen text-gray-900"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
            <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
            <p className="text-gray-600 mb-6">Real-time sales statistics for the current period.</p>

            {loading && <p className="text-gray-500 mb-4">Loading sales data...</p>}
            {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4">Error: {error}</p>}
            
            {/* Sales Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Revenue (Unarchived)" 
                    value={formattedRevenue} 
                    colorVar="--color-accent-total"
                />
                <StatCard 
                    title="Total Transactions" 
                    value={stats.totalTransactions} 
                    colorVar="--color-accent-utility"
                />
                <StatCard 
                    title="Best Selling Item" 
                    value={stats.bestSeller} 
                    colorVar="--color-text-dark"
                />
                <StatCard 
                    title="Last Archive Date" 
                    value={stats.lastArchived} 
                    colorVar="--color-accent-success"
                />
            </div>

            {/* End-of-Day Management Section */}
            <div 
                className="p-6 rounded-xl shadow-xl"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
                <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">End-of-Day Management</h2>
                <p className="text-gray-700 mb-4">
                    Use this button to finalize the current period's sales. This archives the sales data and resets the current counter to zero.
                </p>

                {archiveMessage && (
                    <p className={`mb-4 p-3 rounded text-sm ${archiveMessage.startsWith('Successfully') ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {archiveMessage}
                    </p>
                )}

                <button
                    onClick={handleArchiveAndReset}
                    disabled={loading || stats.totalTransactions === 0}
                    className="py-2 px-4 rounded-lg text-white font-semibold transition disabled:opacity-50"
                    // Use a warning/danger color for this critical action
                    style={{ backgroundColor: 'var(--color-accent-danger)' }}
                >
                    Archive & Reset Daily Sales
                </button>
            </div>
        </div>
    );
}