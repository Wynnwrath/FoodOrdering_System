import { useEffect, useMemo, useState } from "react";

// NOTE: Ensure your API_BASE is correctly pointing to your Node.js port (3000)
// when running via adb reverse. This line is correct for that setup.
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

  // Use the total from the order object if available, otherwise compute it
  const totalDue = selectedOrder ? selectedOrder.total ?? computedTotal : 0;
  
  // FIX 1: Ensure numericCash is never negative
  const numericCash = Math.max(0, Number(cashGiven) || 0);
  
  // FIX 2: ROUNDING LOGIC
  // Standard JS math can result in 4.900000001. 
  // We calculate the difference, multiply by 100, round it, then divide by 100.
  // This ensures the 'change' variable is a clean 2-decimal number (e.g., 4.9)
  const rawChange = numericCash - totalDue;
  const change = Math.max(0, Math.round(rawChange * 100) / 100);

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
      // The 'change' here is now the clean, rounded number calculated above
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
        `Ticket #${selectedOrder.ticketNumber} marked as PAID.\nChange: $${change.toFixed(2)}`
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
    <div 
      className="min-h-[calc(100vh-4rem)] w-full p-2 sm:p-4 flex flex-col md:flex-row gap-4 text-gray-900"
      style={{ backgroundColor: 'var(--color-bg-primary)' }} 
    >
    
      {/* Left: List of SERVED orders */}
      <section 
        className="w-full md:w-2/5 rounded-xl p-3 sm:p-4 flex flex-col shadow-lg"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
          <div>
            <h1 className="text-base md:text-lg font-semibold">SERVED Orders</h1>
            <p className="text-[10px] sm:text-xs text-gray-500">
              Select an order to process payment.
            </p>
          </div>
          <button
            onClick={fetchServedOrders}
            className="px-3 py-1 rounded-lg text-xs font-semibold hover:opacity-80 transition text-white"
            style={{ backgroundColor: 'var(--color-accent-utility)' }}
          >
            Refresh
          </button>
        </header>

        {ordersLoading && <p className="text-gray-700 text-sm">Loading orders...</p>}
        {ordersError && <p className="text-red-600 text-sm mb-2">{ordersError}</p>}

        {orders.length === 0 && !ordersLoading ? (
          <p className="text-gray-500 text-sm">No SERVED orders waiting for payment.</p>
        ) : (
          <div className="mt-2 space-y-2 overflow-y-auto flex-1 max-h-96 md:max-h-full">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => handleSelectOrder(order.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all shadow-sm ${
                  selectedOrderId === order.id
                    ? "bg-blue-50 border-blue-400" 
                    : "bg-white border-gray-200 hover:bg-gray-50" 
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    {/* Show Ticket Number */}
                    <p className="text-sm font-semibold">Ticket #{order.ticketNumber}</p>
                    
                    {order.tableNumber && order.tableNumber > 0 && (
                      <p className="text-[10px] sm:text-xs text-gray-500">Table: {order.tableNumber}</p>
                    )}
                    
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      Items: {order.orders?.length ?? 0}
                    </p>
                  </div>
                  <div className="text-right text-sm mt-2 sm:mt-0">
                    <p className="text-gray-700">
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
                    <span 
                      className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full"
                      style={{ color: 'var(--color-accent-total)', backgroundColor: 'var(--color-bg-status-served)' }}
                    >
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
      <section 
        className="w-full md:flex-1 rounded-xl p-3 sm:p-4 flex flex-col shadow-lg"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <header className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base md:text-lg font-semibold">Payment</h2>
            <p className="text-[10px] sm:text-xs text-gray-500">Process payment for the selected order.</p>
          </div>
          {selectedOrder && (
            <div className="text-[10px] sm:text-xs text-gray-500 text-right">
              <p>Ticket #{selectedOrder.ticketNumber}</p>
              {selectedOrder.tableNumber && selectedOrder.tableNumber > 0 && (
                  <p>Table {selectedOrder.tableNumber}</p>
              )}
            </div>
          )}
        </header>

        {!selectedOrder ? (
          <p className="text-gray-500 text-sm">Select an order from the left to start payment.</p>
        ) : (
          <>
            {/* Items list container */}
            <div className="flex-1 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2">Items</h3>
              
              {menuLoading && <p className="text-gray-500 text-xs">Loading menu...</p>}
              {menuError && <p className="text-red-600 text-xs mb-2">{menuError}</p>}

              <div className="space-y-1 text-sm">
                {selectedOrder.orders?.map((item, idx) => {
                  const menuItem = menuMap[item.itemId];
                  const name = menuItem?.name || `Item ${item.itemId}`;
                  const price = menuItem?.price || 0;
                  const lineTotal = price * item.quantity;

                  return (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{item.quantity} × {name}</span>
                      <span className="text-gray-700">${lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="border-t border-gray-300 mt-3 pt-2 text-sm space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${(selectedOrder.subtotal ?? totalDue / 1.03).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (3%):</span>
                  <span>${(
                    selectedOrder.tax ?? selectedOrder.subtotal * 0.03 ?? totalDue - totalDue / 1.03
                  ).toFixed(2)}</span>
                </div>
                <div 
                  className="flex justify-between text-lg font-bold mt-2"
                  style={{ color: 'var(--color-accent-total)' }}
                >
                  <span>Total Due:</span>
                  <span>${totalDue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cash input */}
            <div className="border-t border-gray-300 pt-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="text-sm text-gray-600 w-full sm:w-32">Cash given</label>
                
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  onKeyDown={(e) => {
                      if(e.key === '-' || e.key === 'e') e.preventDefault();
                  }}
                  placeholder="e.g. 500"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-sm text-gray-600 w-full sm:w-32">Change</span>
                <span 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-accent-success)' }}
                >
                  ${isNaN(change) ? "0.00" : change.toFixed(2)}
                </span>
              </div>

              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleConfirmPayment}
                  disabled={totalDue <= 0 || numericCash < totalDue}
                  className="w-full sm:flex-1 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition text-white"
                  style={{ backgroundColor: 'var(--color-accent-success)' }}
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setCashGiven("");
                  }}
                  className="w-full sm:flex-1 px-4 py-2 rounded-lg bg-gray-300 text-sm font-semibold hover:bg-gray-400 transition text-gray-900"
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