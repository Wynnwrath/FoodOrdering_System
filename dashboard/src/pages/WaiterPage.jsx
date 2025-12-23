import { useMemo, useState, useEffect } from "react";

const API_BASE = "http://localhost:3000"; 

const MODES = ["Take Order", "Serve Orders"];

function MenuItem({ item, onAdd }) {
  return (
    <div 
      key={item.id} 
      className="p-3 rounded-lg shadow flex justify-between items-center transition hover:shadow-lg cursor-pointer border border-transparent hover:border-gray-200"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
      onClick={() => onAdd(item)}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-200 flex items-center justify-center">
            {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full rounded-lg object-cover" />
            ) : (
                <span className="text-[10px] text-gray-500 text-center">No Img</span>
            )}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">{item.name}</h4>
          <p className="text-xs text-gray-500 truncate">{item.category}</p>
          <span className="text-sm font-bold" style={{ color: 'var(--color-accent-total)' }}>
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      </div>
      <button
        className="w-8 h-8 rounded-full text-white font-bold text-lg leading-none flex items-center justify-center flex-shrink-0 hover:opacity-90 transition shadow-sm"
        style={{ backgroundColor: 'var(--color-accent-success)' }}
      >
        +
      </button>
    </div>
  );
}

function OrderCart({ orderItems, onRemove, onUpdateQuantity, onPlaceOrder, orderTotal, tableNumber, setTableNumber }) {
  if (orderItems.length === 0) {
    return (
      <div 
        className="p-4 text-center text-gray-500 rounded-lg h-full flex items-center justify-center shadow-lg border-2 border-dashed border-gray-200"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <p>Cart is empty.</p>
      </div>
    );
  }

  return (
    <div 
        className="rounded-lg shadow-xl flex flex-col h-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <div className="p-3 border-b border-gray-300 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900">Current Order</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {orderItems.map((item) => (
          <div key={item.itemId} className="flex justify-between items-center text-gray-900 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
                <button 
                    className="w-6 h-6 flex items-center justify-center text-xs font-bold text-red-600 bg-white rounded-full hover:bg-red-50 border border-red-200 shadow-sm" 
                    onClick={() => onRemove(item.itemId)}
                >
                    &times;
                </button>
                
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        min="1"
                        className="w-12 p-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        value={item.quantity} 
                        onChange={(e) => onUpdateQuantity(item.itemId, e.target.value)}
                        onBlur={(e) => {
                            // If user leaves it blank, reset to 1
                            if (!e.target.value || parseInt(e.target.value) < 1) {
                                onUpdateQuantity(item.itemId, 1);
                            }
                        }}
                    />
                    <span className="font-semibold truncate max-w-[100px] sm:max-w-xs">{item.name}</span>
                </div>
            </div>
            
            <span className="text-gray-700 font-medium whitespace-nowrap">
                ${(item.price * (Number(item.quantity) || 0)).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-300 bg-gray-50">
          <div className="mb-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                  Table Number <span className="text-red-500">*</span>
              </label>
              <input
                  type="number"
                  placeholder="e.g. 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
          </div>
          <div className="flex justify-between items-center text-lg font-bold mb-2">
              <span className="text-gray-900">Total:</span>
              <span style={{ color: 'var(--color-accent-total)' }}>
                ${orderTotal.toFixed(2)}
              </span>
          </div>
          <button
              onClick={onPlaceOrder}
              disabled={orderItems.length === 0}
              className="w-full py-3 rounded-lg text-lg font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: 'var(--color-accent-success)' }}
          >
              Place Order
          </button>
      </div>
    </div>
  );
}

export default function WaiterPage() {
  const [mode, setMode] = useState("Take Order");
  const [mobileTab, setMobileTab] = useState("menu"); 

  const [activeCategory, setActiveCategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);
  
  const [tableNumber, setTableNumber] = useState("");
  const [orderPlacementError, setOrderPlacementError] = useState("");

  const [readyOrders, setReadyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // --- Fetch Logic ---
  const fetchMenu = async () => {
    try {
        setLoadingMenu(true);
        const res = await fetch(`${API_BASE}/menu`);
        if (!res.ok) throw new Error("Failed to load menu");
        const data = await res.json();
        setMenuItems(data);
    } catch (err) {
        setMenuError("Failed to load menu");
    } finally {
        setLoadingMenu(false);
    }
  };

  const fetchReadyOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
        const res = await fetch(`${API_BASE}/orders?status=READY`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setReadyOrders(data);
    } catch (err) {
        setOrdersError(err.message);
    } finally {
        setOrdersLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  useEffect(() => {
    if (mode === "Serve Orders") {
      fetchReadyOrders();
      const interval = setInterval(fetchReadyOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const categories = useMemo(() => ["All", ...new Set(menuItems.map((i) => i.category))], [menuItems]);
  
  const filteredMenu = useMemo(() => {
    if (!activeCategory || activeCategory === "All") return menuItems;
    return menuItems.filter((i) => i.category === activeCategory);
  }, [menuItems, activeCategory]);

  const orderTotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.price * (Number(item.quantity) || 0), 0);
  }, [orderItems]);

  const handleAddItem = (item) => {
    setOrderItems((prev) => {
      const exists = prev.find((i) => i.itemId === item.id);
      if (exists) {
        return prev.map((i) => i.itemId === item.id ? { ...i, quantity: Number(i.quantity) + 1 } : i);
      }
      return [...prev, { itemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  };

  const handleRemoveItem = (id) => {
    setOrderItems((prev) => prev.filter((i) => i.itemId !== id));
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    setOrderItems((prev) => {
       return prev.map((i) => {
         if (i.itemId === itemId) {
             return { ...i, quantity: newQty };
         }
         return i;
       });
    });
  };

  const handlePlaceOrder = async () => {
    const subtotal = orderTotal;
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const validItems = orderItems.filter(i => Number(i.quantity) > 0);
    
    if (validItems.length === 0) {
        alert("Please add items with valid quantities.");
        return;
    }

    if (!tableNumber || tableNumber.trim() === "") {
        alert("Table number is required!");
        return;
    }

    const body = {
      tableNumber: Number(tableNumber),
      orderItems: validItems.map((i) => ({ itemId: i.itemId, quantity: Number(i.quantity) })), 
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
        if (!res.ok) throw new Error(result.error || "Failed");

        setOrderItems([]);
        setTableNumber("");
        
        alert(`Ticket #${result.order.ticketNumber} placed!`);
        
    } catch (err) {
        setOrderPlacementError(err.message || "Error placing order");
    }
  };

  const markServed = async (orderId) => {
    try {
        await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "SERVED" }),
        });
        setReadyOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div 
        className="h-screen w-full flex flex-col text-gray-900 overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="p-2 shrink-0">
          <div 
            className="flex p-1 rounded-lg shadow-sm"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                  mode === m ? "text-white shadow" : "text-gray-500 hover:bg-gray-100"
                }`}
                style={mode === m ? { backgroundColor: 'var(--color-accent-utility)' } : {}}
              >
                {m}
              </button>
            ))}
          </div>
      </div>

      {mode === "Take Order" && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
            
            <div className="md:hidden flex border-b border-gray-300 bg-white shrink-0">
                <button 
                    onClick={() => setMobileTab("menu")}
                    className={`flex-1 py-3 text-sm font-bold text-center border-b-2 ${mobileTab === 'menu' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    Menu
                </button>
                <button 
                    onClick={() => setMobileTab("cart")}
                    className={`flex-1 py-3 text-sm font-bold text-center border-b-2 ${mobileTab === 'cart' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    Cart ({orderItems.reduce((a, b) => a + (Number(b.quantity)||0), 0)})
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden p-2 gap-3">
 
                <section className={`flex-1 flex-col overflow-hidden ${mobileTab === 'cart' ? 'hidden md:flex' : 'flex'}`}>
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition shadow-sm ${
                                    (activeCategory === cat || (cat === "All" && !activeCategory))
                                    ? "text-white" 
                                    : "bg-white text-gray-600 border border-gray-200"
                                }`}
                                style={(activeCategory === cat || (cat === "All" && !activeCategory)) ? { backgroundColor: 'var(--color-accent-utility)' } : {}}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto pb-10">
                        {loadingMenu && <div className="text-center p-4">Loading...</div>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredMenu.map((item) => (
                                <MenuItem key={item.id} item={item} onAdd={handleAddItem} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className={`w-full md:w-80 flex-col ${mobileTab === 'menu' ? 'hidden md:flex' : 'flex'}`}>
                    <OrderCart 
                        orderItems={orderItems}
                        onRemove={handleRemoveItem}
                        onUpdateQuantity={handleUpdateQuantity}
                        onPlaceOrder={handlePlaceOrder}
                        orderTotal={orderTotal}
                        tableNumber={tableNumber}
                        setTableNumber={setTableNumber}
                    />
                    {orderPlacementError && <p className="text-red-600 text-xs mt-2 text-center bg-red-50 p-1 rounded">{orderPlacementError}</p>}
                </section>
            </div>
        </div>
      )}

      {mode === "Serve Orders" && (
        <div className="flex-1 overflow-y-auto p-4">
             <h2 className="text-xl font-bold mb-4 text-gray-900">Ready to Serve</h2>
             {ordersLoading && <p>Loading...</p>}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyOrders.map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between font-bold text-gray-800">
                            <span>Ticket #{order.ticketNumber}</span>
                            <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">{order.status}</span>
                        </div>
                        {order.tableNumber && <div className="text-xs text-gray-500">Table: {order.tableNumber}</div>}
                        <div className="text-sm text-gray-600 border-t border-b py-2 my-1 max-h-24 overflow-y-auto">
                            {order.items?.map((i, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{i.quantity} x {i.menu?.name}</span>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => markServed(order.id)}
                            className="w-full py-2 rounded-lg text-white font-bold text-sm mt-auto"
                            style={{ backgroundColor: 'var(--color-accent-success)' }}
                        >
                            Mark Served
                        </button>
                    </div>
                ))}
             </div>
        </div>
      )}
    </div>
  );
}