import { useMemo, useState, useEffect } from "react";

// NOTE: This line is correct for your successful ADB setup.
const API_BASE = "http://localhost:3000"; 

const MODES = ["Take Order", "Serve Orders"];

// --- Helper component for rendering individual menu items ---
function MenuItem({ item, onAdd }) {
  // Use a placeholder image if imageUrl is missing or blank
  const itemImage = item.imageUrl || "https://via.placeholder.com/64?text=Food";

  return (
    <div 
      key={item.id} 
      className="p-3 bg-slate-800 rounded-lg shadow-md flex justify-between items-center transition hover:bg-slate-700 cursor-pointer"
      onClick={() => onAdd(item)}
    >
      {/* --- Image and Details --- */}
      <div className="flex items-center gap-3">
        {/* Image element: Small, rounded, and uses object-cover for clean look */}
        <img 
          src={itemImage} 
          alt={item.name} 
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        
        {/* Text Details */}
        <div>
          <h4 className="font-semibold text-white truncate">{item.name}</h4>
          <p className="text-xs text-slate-400">{item.category}</p>
          <span className="text-sm font-bold text-amber-300">${Number(item.price).toFixed(2)}</span>
        </div>
      </div>

      {/* --- Add Button --- */}
      <button
        className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-lg leading-none flex items-center justify-center flex-shrink-0"
        aria-label={`Add ${item.name}`}
      >
        +
      </button>
    </div>
  );
}

// --- Helper component for the current order list (Order Cart) ---
// (No changes to OrderCart component)
function OrderCart({ orderItems, onRemove, onPlaceOrder, orderTotal, tableNumber, setTableNumber }) {
  if (orderItems.length === 0) {
    return (
      <div className="p-4 text-center text-slate-400 bg-slate-800 rounded-lg h-full flex items-center justify-center">
        Tap items on the left to start a new order.
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-xl font-bold text-white">Current Order</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {orderItems.map((item) => (
          <div key={item.itemId} className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-red-500 bg-red-500/10 rounded-full cursor-pointer" onClick={() => onRemove(item.itemId)}>
                    &times;
                </span>
                <span className="font-semibold">{item.quantity} × {item.name}</span>
            </div>
            <span className="text-sm text-slate-300">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700">
          <div className="mb-3">
              <label htmlFor="table-number" className="block text-sm font-medium text-slate-300 mb-1">Table Number (Optional)</label>
              <input
                  id="table-number"
                  type="number"
                  placeholder="e.g. 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
          </div>
          <div className="flex justify-between items-center text-lg font-bold mb-3">
              <span className="text-slate-300">Total:</span>
              <span className="text-amber-300">${orderTotal.toFixed(2)}</span>
          </div>
          <button
              onClick={onPlaceOrder}
              disabled={orderItems.length === 0}
              className="w-full py-3 rounded-lg bg-emerald-500 text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition"
          >
              Place Order
          </button>
      </div>
    </div>
  );
}

// --- Main Waiter Page Component ---
export default function WaiterPage() {
  const [mode, setMode] = useState("Take Order");

  // ----- Menu / taking orders -----
  const [activeCategory, setActiveCategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [tableNumber, setTableNumber] = useState("");
  const [orderPlacementError, setOrderPlacementError] = useState("");

  // ----- Serving orders -----
  const [readyOrders, setReadyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Load menu from backend
  const fetchMenu = async () => {
    // ... (Your existing fetchMenu logic)
    try {
        setLoadingMenu(true);
        setMenuError(null);
        const res = await fetch(`${API_BASE}/menu`);
        if (!res.ok) throw new Error("Failed to load menu");
        const data = await res.json();
        setMenuItems(data);
    } catch (err) {
        console.error(err);
        setMenuError("Failed to load menu");
    } finally {
        setLoadingMenu(false);
    }
  };

  // Load ready orders
  const fetchReadyOrders = async () => {
    // ... (Your existing fetchReadyOrders logic)
    setOrdersLoading(true);
    setOrdersError("");
    try {
        const res = await fetch(`${API_BASE}/orders?status=READY`);
        if (!res.ok) throw new Error("Failed to load ready orders");
        const data = await res.json();
        setReadyOrders(data);
    } catch (err) {
        console.error(err);
        setOrdersError(err.message || "Error loading ready orders");
    } finally {
        setOrdersLoading(false);
    }
  };


  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (mode === "Serve Orders") {
      fetchReadyOrders();
    }
  }, [mode]);


  // Helper Maps & Computed Values
  const categories = useMemo(
    () => [...new Set(menuItems.map((i) => i.category))],
    [menuItems]
  );
  
  const filteredMenu = useMemo(() => {
    if (!activeCategory) return menuItems;
    return menuItems.filter((i) => i.category === activeCategory);
  }, [menuItems, activeCategory]);

  const orderTotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [orderItems]);

  // --- Order taking handlers ---
  const handleAddItem = (itemToAdd) => {
    setOrderPlacementError("");
    setOrderItems((prev) => {
      const existingItem = prev.find((i) => i.itemId === itemToAdd.id);
      if (existingItem) {
        return prev.map((i) =>
          i.itemId === itemToAdd.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [
          ...prev,
          {
            itemId: itemToAdd.id,
            name: itemToAdd.name,
            price: Number(itemToAdd.price),
            quantity: 1,
          },
        ];
      }
    });
  };

  const handleRemoveItem = (itemId) => {
    setOrderPlacementError("");
    setOrderItems((prev) => {
      const existingItem = prev.find((i) => i.itemId === itemId);
      if (existingItem.quantity > 1) {
        return prev.map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      } else {
        return prev.filter((i) => i.itemId !== itemId);
      }
    });
  };

  const handlePlaceOrder = async () => {
    // Basic calculation for subtotal/tax/total
    const subtotal = orderTotal;
    const taxRate = 0.05; // Example 5% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const body = {
      tableNumber: tableNumber ? Number(tableNumber) : null,
      orders: orderItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };

    setOrderPlacementError("");
    try {
        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const result = await res.json();
        
        if (!res.ok) {
            // Check for specific error message from the backend (e.g., table already active)
            throw new Error(result.error || "Failed to place order.");
        }

        // Success: Clear the current order
        setOrderItems([]);
        setTableNumber("");
        alert(`Order #${result.order.id} placed successfully!`);

    } catch (err) {
        console.error("Order Placement Error:", err);
        setOrderPlacementError(err.message || "Failed to place order due to server error.");
    }
  };

  // --- Serving orders handlers ---
  const markServed = async (orderId) => {
    // ... (Your existing markServed logic)
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "SERVED" }),
        });
        if (!res.ok) throw new Error("Failed to mark order as served");
        
        // Remove from the list immediately upon success
        setReadyOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
        console.error(err);
        setOrdersError(err.message || "Error marking order served.");
    }
  };

  // --- Main Render ---
  return (
    <div className="p-4 bg-slate-900 min-h-screen text-white">
      {/* Mode Selector (Top Bar) */}
      <div className="flex bg-slate-800 p-1 rounded-lg mb-4 shadow-xl">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === m ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-slate-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* TAKE ORDER MODE */}
      {mode === "Take Order" && (
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)]"> 
          
          {/* Menu Panel (Scrollable, takes up screen width on mobile) */}
          <section className="flex-1 min-h-[50vh] md:min-h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-3 text-emerald-400">Menu Items</h2>
            
            {/* Category Selector */}
            <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveCategory("")}
                    className={`px-3 py-1 text-sm rounded-full transition ${!activeCategory ? "bg-amber-500 text-black font-semibold" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 text-sm rounded-full transition ${activeCategory === cat ? "bg-amber-500 text-black font-semibold" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {loadingMenu && <p className="text-slate-400">Loading menu...</p>}
              {menuError && <p className="text-red-500">Error: {menuError}</p>}
              {!loadingMenu && filteredMenu.length === 0 && <p className="text-slate-400">No items found in this category.</p>}
              
              {filteredMenu.map((item) => (
                <MenuItem key={item.id} item={item} onAdd={handleAddItem} />
              ))}
            </div>
          </section>

          {/* Order Cart (Fixed Height on Mobile, Scrollable on Desktop) */}
          <section className="w-full md:w-80 min-h-[50vh] md:min-h-full">
            <OrderCart 
                orderItems={orderItems} 
                onRemove={handleRemoveItem} 
                onPlaceOrder={handlePlaceOrder} 
                orderTotal={orderTotal}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
            />
            {orderPlacementError && <p className="text-red-500 text-sm mt-2">{orderPlacementError}</p>}
          </section>

        </div>
      )}

      {/* SERVE ORDERS MODE */}
      {mode === "Serve Orders" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Ready Orders</h2>

          {ordersLoading && <p className="text-slate-400">Loading ready orders...</p>}
          {ordersError && <p className="text-red-500">Error: {ordersError}</p>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {readyOrders.length === 0 && !ordersLoading && (
              <p className="text-slate-400 col-span-full">No orders are currently ready to be served.</p>
            )}

            {readyOrders.map((order) => {
              // ... (Calculate orderTotal and menuMap as you would normally)
              const orderTotal = order.items.reduce((acc, item) => acc + (item.menu?.price || 0) * item.quantity, 0);

              return (
                <div key={order.id} className="bg-slate-800 rounded-xl p-4 flex flex-col gap-2 shadow-xl">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                      {order.status}
                    </span>
                  </div>
                  {order.tableNumber && <p className="text-xs text-slate-400">Table: {order.tableNumber}</p>}
                  
                  {/* Order Items List */}
                  <div className="mt-2 space-y-1 text-sm max-h-32 overflow-auto pr-1 border-y border-slate-700 py-2">
                    {order.items?.map((item, idx) => {
                      // Note: Assuming item.menu is populated with the menu item details
                      return (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{item.quantity} × {item.menu?.name || `Item ${item.menuId}`}</span>
                          <span className="text-slate-300">${((item.menu?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-700 mt-3 pt-2 text-sm flex justify-between text-slate-300">
                    <span>Total:</span>
                    <span className="font-semibold text-amber-300">${orderTotal.toFixed(2)}</span>
                  </div>
                  
                  <button 
                    onClick={() => markServed(order.id)} 
                    className="mt-3 w-full py-2 rounded-lg bg-emerald-500 text-sm font-semibold hover:bg-emerald-400 transition"
                  >
                    Mark as Served
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}