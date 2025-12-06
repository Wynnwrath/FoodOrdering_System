import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function CashierPage() {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cashGiven, setCashGiven] = useState("");

  // Load SERVED orders
  const fetchServedOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");
      const res = await fetch(`${API_BASE}/orders?status=SERVED`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setOrdersError(err.message || "Error loading orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load menu
  const fetchMenu = async () => {
    try {
      setMenuLoading(true);
      setMenuError("");
      const res = await fetch(`${API_BASE}/menu`);
      if (!res.ok) throw new Error("Failed to fetch menu");
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error(err);
      setMenuError(err.message || "Error loading menu");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    fetchServedOrders();
    fetchMenu();
  }, []);

  const menuMap = useMemo(() => {
    const map = {};
    menu.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [menu]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const computedTotal = useMemo(() => {
    if (!selectedOrder || !selectedOrder.orders) return 0;
    return selectedOrder.orders.reduce((sum, item) => {
      const menuItem = menuMap[item.itemId];
      if (!menuItem) return sum;
      return sum + menuItem.price * item.quantity;
    }, 0);
  }, [selectedOrder, menuMap]);

  const totalDue = selectedOrder ? selectedOrder.total ?? computedTotal : 0;
  const numericCash = Number(cashGiven) || 0;
  const change = Math.max(numericCash - totalDue, 0);

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setCashGiven("");
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    if (numericCash <= 0 || numericCash < totalDue) {
      alert("Cash given must be at least the total amount.");
      return;
    }

    try {
      const payload = {
        status: "PAID",
        paidAmount: numericCash,
        change,
      };

      const res = await fetch(
        `${API_BASE}/orders/${selectedOrder.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update order");

      const data = await res.json();
      console.log("Order paid:", data);

      alert(
        `Order #${selectedOrder.id} marked as PAID.\nChange: $${change.toFixed(
          2
        )}`
      );

      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      setSelectedOrderId(null);
      setCashGiven("");
    } catch (err) {
      console.error(err);
      alert("Failed to confirm payment.");
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-white p-4 flex flex-col md:flex-row gap-4">
      {/* Left: List of SERVED orders */}
      <section className="w-full md:w-2/5 bg-slate-800 rounded-xl p-4 flex flex-col">
        <header className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base md:text-lg font-semibold">SERVED Orders</h1>
            <p className="text-[10px] md:text-xs text-slate-400">
              Select an order to process payment.
            </p>
          </div>
          <button
            onClick={fetchServedOrders}
            className="px-3 py-1 rounded-lg bg-sky-500 text-xs font-semibold hover:bg-sky-400 transition"
          >
            Refresh
          </button>
        </header>

        {ordersLoading && (
          <p className="text-slate-300 text-sm">Loading orders...</p>
        )}
        {ordersError && (
          <p className="text-red-400 text-sm mb-2">{ordersError}</p>
        )}

        {orders.length === 0 && !ordersLoading ? (
          <p className="text-slate-400 text-sm">
            No SERVED orders waiting for payment.
          </p>
        ) : (
          <div className="mt-2 space-y-2 overflow-auto max-h-72">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => handleSelectOrder(order.id)}
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedOrderId === order.id
                    ? "border-emerald-400 bg-slate-900"
                    : "border-slate-700 bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold">Order #{order.id}</p>
                    {order.tableNumber && (
                      <p className="text-[10px] md:text-xs text-slate-400">
                        Table: {order.tableNumber}
                      </p>
                    )}
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">
                      Items: {order.orders?.length ?? 0}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-300">
                      Total: $
                      {(order.total ??
                        order.orders?.reduce((sum, item) => {
                          const menuItem = menuMap[item.itemId];
                          if (!menuItem) return sum;
                          return sum + menuItem.price * item.quantity;
                        }, 0) ??
                        0
                      ).toFixed(2)}
                    </p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      {order.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Right: Payment details */}
      <section className="w-full md:flex-1 bg-slate-800 rounded-xl p-4 flex flex-col">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold">Payment</h2>
            <p className="text-[10px] md:text-xs text-slate-400">
              Process payment for the selected order.
            </p>
          </div>
          {selectedOrder && (
            <div className="text-right text-[10px] md:text-xs text-slate-400">
              <p>Order #{selectedOrder.id}</p>
              {selectedOrder.tableNumber && <p>Table {selectedOrder.tableNumber}</p>}
            </div>
          )}
        </header>

        {!selectedOrder ? (
          <p className="text-slate-400 text-sm">
            Select an order from the left to start payment.
          </p>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-auto mb-4 border border-slate-700 rounded-lg p-3 max-h-72">
              <h3 className="text-sm font-semibold mb-2">Items</h3>

              {menuLoading && (
                <p className="text-slate-400 text-xs">Loading menu...</p>
              )}
              {menuError && (
                <p className="text-red-400 text-xs mb-2">{menuError}</p>
              )}

              <div className="space-y-1 text-sm">
                {selectedOrder.orders?.map((item, idx) => {
                  const menuItem = menuMap[item.itemId];
                  const name = menuItem?.name || `Item ${item.itemId}`;
                  const price = menuItem?.price || 0;
                  const lineTotal = price * item.quantity;

                  return (
                    <div key={idx} className="flex justify-between items-center">
                      <span>
                        {item.quantity} × {name}
                      </span>
                      <span className="text-slate-300">${lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-700 mt-3 pt-2 text-sm space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>${(selectedOrder.subtotal ?? totalDue / 1.03).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax (3%):</span>
                  <span>
                    ${(
                      selectedOrder.tax ??
                      selectedOrder.subtotal * 0.03 ??
                      totalDue - totalDue / 1.03
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-emerald-300 mt-2">
                  <span>Total Due:</span>
                  <span>${totalDue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cash input */}
            <div className="border-t border-slate-700 pt-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="text-sm text-slate-300 w-full sm:w-32">
                  Cash given
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring focus:ring-emerald-500"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-sm text-slate-300 w-full sm:w-32">Change</span>
                <span className="text-lg font-semibold text-emerald-300">
                  ${isNaN(change) ? "0.00" : change.toFixed(2)}
                </span>
              </div>

              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleConfirmPayment}
                  disabled={totalDue <= 0 || numericCash < totalDue}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition"
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setCashGiven("");
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-600 text-sm font-semibold hover:bg-slate-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
