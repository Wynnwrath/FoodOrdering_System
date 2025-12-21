import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch pending orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/orders?status=PENDING`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  // Mark order as READY
  const markCompleted = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "READY" }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error(err);
      alert("Could not mark as completed.");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="min-h-[calc(100vh-4rem)] w-full p-2 sm:p-4 flex flex-col gap-6 text-gray-900"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Kitchen Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing orders with status: <span className="font-semibold text-orange-600">PENDING</span>
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition text-white shadow-sm"
          style={{ backgroundColor: 'var(--color-accent-utility)' }}
        >
          Refresh
        </button>
      </header>

      {/* Status messages */}
      {loading && <p className="text-gray-600">Loading orders...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">No pending orders.</p>
            <p className="text-sm">Kitchen is clear!</p>
        </div>
      )}

      {/* Orders grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto pb-10">
        {orders.map((order) => {
          return (
            // MATCHING CARD STYLE FROM WAITER PAGE
            <div 
                key={order.id} 
                className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-2"
            >
                <div className="flex justify-between font-bold text-gray-800">
                    {/* --- CHANGED: Use Ticket Number --- */}
                    <span>Ticket #{order.ticketNumber}</span>
                    <span className="text-orange-600 text-sm bg-orange-50 px-2 py-1 rounded-full">
                        {order.status}
                    </span>
                </div>

                {order.tableNumber ? (
                    <div className="text-xs text-gray-500 font-semibold">Table: {order.tableNumber}</div>
                ) : (
                    <div className="text-xs text-gray-400 italic">No Table</div>
                )}

                <div className="text-sm text-gray-600 border-t border-b py-2 my-1 max-h-40 overflow-y-auto space-y-1">
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span>{item.quantity} × {item.menu?.name || "Unknown Item"}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => markCompleted(order.id)}
                    className="w-full py-2 rounded-lg text-white font-bold text-sm mt-auto shadow-sm hover:opacity-90 transition"
                    style={{ backgroundColor: 'var(--color-accent-success)' }}
                >
                    Mark Ready
                </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}