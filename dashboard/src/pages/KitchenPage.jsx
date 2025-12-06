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
    <div className="h-full w-full bg-slate-900 text-white p-4 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Kitchen Orders</h1>
          <p className="text-sm text-slate-400 mt-1">
            Showing orders with status: <span className="font-semibold">PENDING</span>
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-lg bg-sky-500 text-sm font-semibold hover:bg-sky-400 transition"
        >
          Refresh
        </button>
      </header>

      {/* Status messages */}
      {loading && <p className="text-slate-300">Loading orders...</p>}
      {error && <p className="text-red-400 mb-2">{error}</p>}
      {!loading && orders.length === 0 && (
        <p className="text-slate-400 mt-6">No pending orders right now.</p>
      )}

      {/* Orders grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => {
          const computedTotal =
            order.items?.reduce((sum, item) => {
              const price = item.menu?.price || 0;
              return sum + price * item.quantity;
            }, 0) ?? 0;
          const orderTotal = order.total ?? computedTotal;

          return (
            <div
              key={order.id}
              className="bg-slate-800 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold text-lg truncate">Order #{order.id}</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 max-h-40 overflow-auto pr-1 text-sm">
                {order.items?.map((item) => {
                  const name = item.menu?.name || "Unknown item";
                  const price = item.menu?.price || 0;
                  const qty = item.quantity;
                  const lineTotal = qty * price;

                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <span className="truncate">{qty} × {name}</span>
                      <span className="text-slate-300">${lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-700 mt-3 pt-2 text-sm flex justify-between text-slate-300">
                <span>Total:</span>
                <span className="font-semibold">${orderTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => markCompleted(order.id)}
                className="mt-3 w-full py-2 rounded-lg bg-emerald-500 text-sm font-semibold hover:bg-emerald-400 transition"
              >
                Mark as Completed
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
