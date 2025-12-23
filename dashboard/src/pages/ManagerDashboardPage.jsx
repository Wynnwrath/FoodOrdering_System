import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";
const MODES = ["Dashboard", "Order History"];

function StatCard({ title, value, colorVar }) {
    return (
        <div 
            className="p-4 rounded-xl shadow-lg flex flex-col justify-between h-24 sm:h-28 relative overflow-hidden shrink-0 w-full"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
            <div className="z-10">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
                <p 
                    className="text-2xl sm:text-3xl font-bold mt-1"
                    style={{ color: `var(${colorVar})` }}
                >
                    {value}
                </p>
            </div>
            <div 
                className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-10 z-0"
                style={{ backgroundColor: `var(${colorVar})` }}
            />
        </div>
    );
}

function TopItemsChart({ items }) {
    if (!items || items.length === 0) return <p className="text-gray-500 text-sm italic">No sales data yet.</p>;
    const maxCount = Math.max(...items.map(i => i.count));
    return (
        <div className="flex flex-col gap-3 mt-2">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                    <span className="w-24 sm:w-32 truncate font-medium text-gray-700 text-right" title={item.name}>{item.name}</span>
                    <div className="flex-1 h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                                width: `${(item.count / maxCount) * 100}%`,
                                backgroundColor: 'var(--color-accent-utility)' 
                            }}
                        />
                    </div>
                    <span className="w-6 font-bold text-gray-900 text-right">{item.count}</span>
                </div>
            ))}
        </div>
    );
}

export default function ManagerDashboardPage() {
    // --- UI STATE ---
    const [mode, setMode] = useState("Dashboard");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [archiveMessage, setArchiveMessage] = useState("");
    const [activeTab, setActiveTab] = useState("charts");

    // --- DATA STATE ---
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        pendingCount: 0, 
        readyCount: 0,   
        servedCount: 0,  
        topItems: [],      
        recentOrders: [], 
    });
    
    const [historyOrders, setHistoryOrders] = useState([]);

    // --- FETCHERS ---
    const fetchSalesStats = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_BASE}/dashboard/stats`);
            if (!res.ok) throw new Error("Failed to load dashboard data");
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error(err);
            setError("Could not load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/orders?status=ARCHIVED`);
            if (!res.ok) throw new Error("Failed to load history");
            const data = await res.json();
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setHistoryOrders(sorted);
        } catch (err) {
            console.error(err);
            setError("Could not load order history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mode === "Dashboard") fetchSalesStats();
        if (mode === "Order History") fetchHistory();
    }, [mode]);

    // --- HANDLERS ---
    const handleArchiveAndReset = async () => {
        if (!window.confirm("ARE YOU SURE? This will End the Day and RESET Ticket # to 1.")) return;
        try {
            setArchiveMessage("Ending Day...");
            const res = await fetch(`${API_BASE}/dashboard/archive`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");

            setArchiveMessage(data.message);
            
            if (mode === "Dashboard") fetchSalesStats();
            else fetchHistory();

            setTimeout(() => setArchiveMessage(""), 5000);
        } catch (err) {
            setArchiveMessage("");
            alert(err.message);
        }
    };

    const handleRefresh = () => {
        if (mode === "Dashboard") fetchSalesStats();
        else fetchHistory();
    };

    return (
        <div 
            className="p-3 sm:p-6 min-h-screen text-gray-900 flex flex-col gap-4 sm:gap-6"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Overview & Daily Management.</p>
                    </div>

                    <div className="flex flex-wrap w-full md:w-auto gap-2">
                        <div 
                            className="flex p-1 rounded-lg shadow-sm bg-gray-200 mr-2"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                            {MODES.map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all ${
                                mode === m ? "text-white shadow" : "text-gray-500 hover:bg-gray-100"
                                }`}
                                style={mode === m ? { backgroundColor: 'var(--color-accent-utility)' } : {}}
                            >
                                {m}
                            </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleRefresh}
                            className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm hover:opacity-80 transition text-gray-700 font-semibold"
                        >
                            Refresh
                        </button>

                        {mode === "Dashboard" && (
                            <button
                                onClick={handleArchiveAndReset}
                                disabled={stats.recentOrders.length === 0}
                                className="flex-1 md:flex-none px-4 py-2 rounded-lg text-white font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                            >
                                End Day
                            </button>
                        )}
                    </div>
                </div>

                {archiveMessage && (
                    <div className="bg-green-100 text-green-800 p-2 sm:p-3 rounded text-xs sm:text-sm font-bold text-center border border-green-200">
                        {archiveMessage}
                    </div>
                )}
            </div>

            {loading && <p className="text-gray-500 text-center py-4 text-sm">Loading data...</p>}
            {error && <p className="text-red-500 text-center py-4 text-sm">{error}</p>}

            {/* ========================================= */}
            {/* MODE 1: DASHBOARD (Active Day)            */}
            {/* ========================================= */}
            {mode === "Dashboard" && !loading && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard title="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} colorVar="--color-accent-total" />
                        <StatCard title="Paid Orders" value={stats.totalTransactions} colorVar="--color-accent-utility" />
                        <div className="hidden lg:block lg:col-span-2"></div> 
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-2 ml-1">Live Kitchen Status</h3>
                        <div className="flex overflow-x-auto gap-3 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
                            <div className="min-w-[140px] sm:min-w-0 flex-1"><StatCard title="Pending" value={stats.pendingCount} colorVar="--color-status-pending" /></div>
                            <div className="min-w-[140px] sm:min-w-0 flex-1"><StatCard title="Ready" value={stats.readyCount} colorVar="--color-status-ready" /></div>
                            <div className="min-w-[140px] sm:min-w-0 flex-1"><StatCard title="Served" value={stats.servedCount} colorVar="--color-status-served" /></div>
                        </div>
                    </div>

                    <div className="flex p-1 bg-gray-200 rounded-lg lg:hidden mb-2">
                        <button onClick={() => setActiveTab("charts")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'charts' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Top Items</button>
                        <button onClick={() => setActiveTab("logs")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'logs' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Order Log</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={`bg-white p-4 sm:p-5 rounded-xl shadow-lg border border-gray-200 h-fit ${activeTab === 'logs' ? 'hidden lg:block' : 'block'}`}>
                            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2 text-sm sm:text-base">Top 5 Best Sellers</h3>
                            <TopItemsChart items={stats.topItems} />
                        </div>

                        <div className={`lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${activeTab === 'charts' ? 'hidden lg:flex' : 'flex'}`}>
                            <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-sm sm:text-base">Order Logbook (Active)</h3>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <OrdersTable orders={stats.recentOrders} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {mode === "Order History" && !loading && (
                <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-800">Archived Orders</h3>
                        <p className="text-xs text-gray-500">History of all orders processed and ended.</p>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        {historyOrders.length === 0 ? (
                            <p className="p-8 text-center text-gray-500">No archived history found.</p>
                        ) : (
                            <OrdersTable orders={historyOrders} isHistory={true} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function OrdersTable({ orders, isHistory = false }) {
    if (!orders || orders.length === 0) {
        return <div className="p-6 text-center text-gray-400">No orders to display.</div>;
    }

    return (
        <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-[10px] sm:text-xs">
                <tr>
                    <th className="p-2 sm:p-3">Ticket</th>
                    <th className="p-2 sm:p-3">Date & Time</th>
                    <th className="p-2 sm:p-3 w-1/3">Items</th>
                    <th className="p-2 sm:p-3">Table</th>
                    <th className="p-2 sm:p-3">Total</th>
                    <th className="p-2 sm:p-3">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                        <td className="p-2 sm:p-3 font-mono text-gray-500">
                            <span className="font-bold text-gray-800">#{order.ticketNumber}</span>
                            <span className="hidden sm:inline text-[10px] ml-1">({order.id})</span>
                        </td>
                        <td className="p-2 sm:p-3 text-gray-600">
                    
                            {new Date(order.createdAt).toLocaleString([], {
                                month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                            })}
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700 overflow-hidden text-ellipsis max-w-[150px] sm:max-w-xs" 
                            title={order.items?.map(i => `${i.quantity}x ${i.menu ? i.menu.name : 'Item'}`).join(", ")}>
                            {order.items && order.items.length > 0 
                                ? order.items.map(i => `${i.quantity}x ${i.menu ? i.menu.name : 'Item'}`).join(", ")
                                : <span className="text-gray-400 italic">No items</span>
                            }
                        </td>
                        <td className="p-2 sm:p-3 font-bold text-gray-800">{order.tableNumber || "-"}</td>
                        <td className="p-2 sm:p-3 font-bold text-green-700">${order.total.toFixed(2)}</td>
                        <td className="p-2 sm:p-3">
                            <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold ${
                                order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                order.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'ARCHIVED' ? 'bg-gray-200 text-gray-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {order.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}