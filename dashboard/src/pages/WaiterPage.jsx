import { useMemo, useState, useEffect } from "react";

const API_BASE = "http://localhost:3000";
const MODES = ["Take Order", "Serve Orders"];

export default function WaiterPage() {
  const [mode, setMode] = useState("Take Order");

  // ----- Menu / taking orders -----
  const [activeCategory, setActiveCategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [tableNumber, setTableNumber] = useState("");

  // ----- Serving orders -----
  const [readyOrders, setReadyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Load menu from backend
  useEffect(() => {
    const fetchMenu = async () => {
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
    fetchMenu();
  }, []);

  // Categories
  const categories = useMemo(() => {
    const set = new Set();
    menuItems.forEach((item) => item.category && set.add(item.category));
    return Array.from(set);
  }, [menuItems]);

  useEffect(() => {
    if (!categories.length) return;
    if (!activeCategory || !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Menu map for serve mode
  const menuMap = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => (map[item.id] = item));
    return map;
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    const list = Array.isArray(menuItems) ? menuItems : [];
    return activeCategory ? list.filter((i) => i.category === activeCategory) : list;
  }, [activeCategory, menuItems]);

  // Order functions
  const addToOrder = (item) => {
    setOrderItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const changeQuantity = (id, delta) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
          .filter((i) => i.quantity > 0)
    );
  };

  const clearOrder = () => setOrderItems([]);

  // Totals
  const subtotal = useMemo(() => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [orderItems]);
  const taxRate = 0.03;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleSendToKitchen = async () => {
    if (!orderItems.length) return;
    try {
      const payload = {
        orders: orderItems.map((item) => ({ itemId: item.id, quantity: item.quantity })),
        subtotal, tax, total, tableNumber: tableNumber || null,
      };
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send order");
      const data = await res.json();
      alert(`Order #${data.order?.id ?? ""} sent to kitchen!`);
      clearOrder();
    } catch (err) {
      console.error(err);
      alert("Failed to send order to kitchen. Table is currently Occupied.");
    }
  };

  // Serve orders
  const fetchReadyOrders = async () => {
    try {
      setOrdersLoading(true); setOrdersError("");
      const res = await fetch(`${API_BASE}/orders?status=READY`);
      if (!res.ok) throw new Error("Failed to fetch ready orders");
      const data = await res.json();
      setReadyOrders(data);
    } catch (err) {
      console.error(err); setOrdersError(err.message || "Error loading orders");
    } finally { setOrdersLoading(false); }
  };

  useEffect(() => {
    if (mode === "Serve Orders") {
      fetchReadyOrders();
      const interval = setInterval(fetchReadyOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const markServed = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "SERVED" }),
      });
      if (!res.ok) throw new Error("Failed to mark as served");
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error(err);
      alert("Could not mark as served.");
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-white p-4 flex flex-col gap-4">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-2">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              mode === m ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "Take Order" ? (
        <div className="h-full w-full bg-slate-900 text-white flex flex-col md:flex-row gap-4 flex-1">
          {/* Left: Menu */}
          <section className="w-full md:w-2/5 bg-slate-800 rounded-xl p-4 flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400">Menu</h2>
              <div className="flex gap-2 mt-3 flex-wrap">
                {categories.length === 0 ? <span className="text-xs text-slate-500">No categories yet.</span> :
                  categories.map((cat) => (
                    <button key={cat} className={`px-3 py-1 rounded-full text-sm border ${activeCategory === cat ? "bg-amber-400 text-red-500 border-amber-400" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                  ))
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-auto max-h-64 pr-1">
              {loadingMenu ? <p className="text-slate-400 col-span-2 text-sm">Loading menu...</p> :
               menuError ? <p className="text-red-400 col-span-2 text-sm">{menuError}</p> :
               filteredMenu.length === 0 ? <p className="text-slate-400 col-span-2 text-sm">No items in this category yet.</p> :
               filteredMenu.map((item) => (
                 <button key={item.id} onClick={() => addToOrder(item)} className="bg-slate-700 rounded-xl p-3 flex flex-col items-start hover:bg-slate-600 transition">
                   <div className="w-full h-50 rounded-lg bg-slate-500/40 mb-3 overflow-hidden flex items-center justify-center">
                     {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/> : <span className="text-xs text-slate-300">No image</span>}
                   </div>
                   <span className="font-semibold text-sm">{item.name}</span>
                   <span className="text-amber-300 text-sm">${item.price.toFixed(2)}</span>
                 </button>
               ))
              }
            </div>
          </section>

          {/* Middle: Current Order */}
          <section className="w-full md:w-2/5 bg-slate-800 rounded-xl p-4 flex flex-col">
            <header className="flex justify-between items-center mb-3 flex-col sm:flex-row sm:items-center gap-2">
              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400">Current Order</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">Table #</span>
                  <input type="text" className="w-full sm:w-20 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs focus:outline-none focus:ring focus:ring-sky-500" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g. 5"/>
                </div>
              </div>
              <button onClick={clearOrder} className="text-xs px-3 py-1 rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700">Clear</button>
            </header>

            <div className="flex-1 overflow-auto pr-1 space-y-2 max-h-64">
              {orderItems.length === 0 ? <p className="text-slate-400 text-sm mt-4">No items yet. Tap a menu item to add it.</p> :
                orderItems.map((item) => (
                  <div key={item.id} className="bg-slate-700 rounded-lg px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-lg leading-none" onClick={() => changeQuantity(item.id, -1)}>–</button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-lg leading-none" onClick={() => changeQuantity(item.id, 1)}>+</button>
                      <span className="ml-4 text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Totals */}
            <div className="border-t border-slate-700 mt-4 pt-3 text-sm space-y-1">
              <div className="flex justify-between text-slate-300"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Tax (3%):</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold text-emerald-300 mt-2"><span>Total:</span><span>${total.toFixed(2)}</span></div>
            </div>
          </section>

          {/* Right: Actions */}
          <section className="w-full md:w-1/5 bg-slate-800 rounded-xl p-4 flex flex-col">
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-3">Actions</h2>
            <div className="space-y-2 mb-4">
              <button onClick={handleSendToKitchen} disabled={orderItems.length === 0} className="w-full py-2 rounded-lg bg-sky-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-400 transition">Send to Kitchen</button>
            </div>
          </section>
        </div>
      ) : (
        <section className="flex-1 bg-slate-800 rounded-xl p-4">
          <header className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
            <div>
              <h2 className="text-lg font-semibold">Ready to Serve</h2>
              <p className="text-xs text-slate-400">Orders marked READY by the kitchen.</p>
            </div>
            <button onClick={fetchReadyOrders} className="px-4 py-2 rounded-lg bg-sky-500 text-sm font-semibold hover:bg-sky-400 transition">Refresh</button>
          </header>

          {ordersLoading && <p className="text-slate-300 text-sm">Loading orders...</p>}
          {ordersError && <p className="text-red-400 text-sm mb-2">{ordersError}</p>}

          {readyOrders.length === 0 && !ordersLoading ? <p className="text-slate-400 text-sm">No READY orders at the moment.</p> :
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-auto">
              {readyOrders.map((order) => {
                const computedTotal = order.orders?.reduce((sum, item) => {
                  const menuItem = menuMap[item.itemId];
                  return menuItem ? sum + menuItem.price * item.quantity : sum;
                }, 0) ?? 0;
                const orderTotal = order.total ?? computedTotal;

                return (
                  <div key={order.id} className="bg-slate-900 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">{order.status}</span>
                    </div>
                    {order.tableNumber && <p className="text-xs text-slate-400">Table: {order.tableNumber}</p>}
                    <div className="mt-2 space-y-1 text-sm max-h-32 overflow-auto pr-1">
                      {order.orders?.map((item, idx) => {
                        const menuItem = menuMap[item.itemId];
                        return <div key={idx} className="flex justify-between items-center">{item.quantity} × {menuItem?.name || `Item ${item.itemId}`}</div>;
                      })}
                    </div>
                    <div className="border-t border-slate-700 mt-3 pt-2 text-sm flex justify-between text-slate-300">
                      <span>Total:</span><span className="font-semibold">${orderTotal.toFixed(2)}</span>
                    </div>
                    <button onClick={() => markServed(order.id)} className="mt-3 w-full py-2 rounded-lg bg-emerald-500 text-sm font-semibold hover:bg-emerald-400 transition">Mark as Served</button>
                  </div>
                );
              })}
            </div>
          }
        </section>
      )}
    </div>
  );
}
