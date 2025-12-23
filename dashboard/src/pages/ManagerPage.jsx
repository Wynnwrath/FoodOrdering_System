import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";
const CUSTOM_VALUE = "__custom";

const MODES = ["Menu Editor", "Activity Log"];

export default function ManagerPage() {
  const [mode, setMode] = useState("Menu Editor");
  
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState("Burgers");
  const [customCategory, setCustomCategory] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [logs, setLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- FETCHERS ---
  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/menu`);
      if (!res.ok) throw new Error("Failed to fetch menu");
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading menu");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    fetch(`${API_BASE}/history`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    if (mode === "Menu Editor") fetchMenu();
    if (mode === "Activity Log") fetchHistory();
  }, [mode]);


  // --- MENU HELPERS ---
  const categories = useMemo(() => {
    const set = new Set(["Burgers", "Pizza", "Salads", "Drinks", "Desserts"]);
    menu.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menu]);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert("Please enter name and price.");
      return;
    }

    const finalCategory =
      category === CUSTOM_VALUE ? customCategory.trim() || "Uncategorized" : category;

    let finalImageUrl = imageUrl || "";
    if (imageFile) {
      try {
        finalImageUrl = await fileToDataUrl(imageFile);
      } catch (err) {
        console.error(err);
        alert("Failed to read image file.");
        return;
      }
    }

    const payload = { name: name.trim(), price: Number(price), category: finalCategory, imageUrl: finalImageUrl };

    try {
      if (editingId === null) {
        const res = await fetch(`${API_BASE}/menu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to add menu item");
        const data = await res.json();
        setMenu((prev) => [...prev, data.item || { ...payload, id: Date.now() }]);
      } else {
        const res = await fetch(`${API_BASE}/menu/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update menu item");
        const data = await res.json();
        const updated = data.item || { ...payload, id: editingId };
        setMenu((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      }

      // Reset form
      setName("");
      setPrice("");
      setCategory("Burgers");
      setCustomCategory("");
      setEditingId(null);
      setImageFile(null);
      setImagePreview("");
      setImageUrl("");
    } catch (err) {
      console.error(err);
      alert("Could not save item.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      const res = await fetch(`${API_BASE}/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete menu item");
      setMenu((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete item.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("Burgers");
    setCustomCategory("");
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };


  return (
    <div 
      className="h-full w-full p-4 flex flex-col gap-4 text-gray-900 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
           <h1 className="text-2xl font-bold">Manager Hub</h1>
           <p className="text-sm text-gray-500">Manage menu items and view system history.</p>
        </div>
        
        <div 
            className="flex p-1 rounded-lg shadow-sm w-full sm:w-auto"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
            {MODES.map((m) => (
            <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
                mode === m ? "text-white shadow" : "text-gray-500 hover:bg-gray-100"
                }`}
                style={mode === m ? { backgroundColor: 'var(--color-accent-utility)' } : {}}
            >
                {m}
            </button>
            ))}
        </div>
      </div>
      {mode === "Menu Editor" && (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Form Section */}
            <section 
                className="rounded-xl p-4 flex flex-col lg:flex-row lg:items-end gap-3 shadow-lg shrink-0"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
                {/* Name */}
                <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bacon Burger"
                />
                </div>

                {/* Price */}
                <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Price</label>
                <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 9.99"
                />
                </div>

                {/* Category */}
                <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Category</label>
                <select
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                    value={category}
                    onChange={(e) => {
                    const value = e.target.value;
                    setCategory(value);
                    if (value !== CUSTOM_VALUE) setCustomCategory("");
                    }}
                >
                    {categories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                    ))}
                    <option value={CUSTOM_VALUE}>+ Add new category…</option>
                </select>

                {category === CUSTOM_VALUE && (
                    <input
                    type="text"
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Enter new category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    />
                )}
                </div>

               {/* Image Input */}
                <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Image</label>

                    <input 
                        type="file" 
                        accept="image/*" 
                        className="w-full text-xs text-gray-500" 
                        onChange={handleImageChange} 
                    />

                    {(imagePreview || imageUrl) && (
                        <div className="mt-2 w-full h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-300 flex items-center justify-center">
                            <img src={imagePreview || imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 min-w-[200px]">
                <button
                    type="button"
                    onClick={handleSaveItem}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition text-white"
                    style={{ backgroundColor: 'var(--color-accent-success)' }}
                >
                    {editingId === null ? "Add Item" : "Save Changes"}
                </button>
                {editingId !== null && (
                    <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-lg bg-gray-300 text-sm font-semibold hover:bg-gray-400 transition text-gray-900"
                    >
                    Cancel
                    </button>
                )}
                </div>
            </section>

            {/* Menu Items Grid */}
            <section className="flex-1 overflow-y-auto">
                {loading && <p className="text-gray-600 text-sm">Loading menu...</p>}
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                {!loading && menu.length === 0 ? (
                <p className="text-gray-500 text-sm">No menu items yet.</p>
                ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-10">
                    {menu.map((item) => (
                    <div 
                        key={item.id} 
                        className="rounded-xl p-4 flex flex-col gap-2 shadow-lg hover:shadow-xl transition border border-transparent hover:border-gray-200"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] text-gray-500">No image</span>
                        )}
                        </div>
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.category}</p>
                        <p 
                        className="text-sm font-bold"
                        style={{ color: 'var(--color-accent-total)' }}
                        >
                        ${Number(item.price).toFixed(2)}
                        </p>
                        <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => {
                            setEditingId(item.id);
                            setName(item.name);
                            setPrice(item.price);
                            setCategory(categories.includes(item.category) ? item.category : CUSTOM_VALUE);
                            setCustomCategory(categories.includes(item.category) ? "" : item.category);
                            setImageUrl(item.imageUrl || "");
                            setImageFile(null);
                            setImagePreview("");
                            }}
                            className="flex-1 px-2 py-1 rounded-lg bg-gray-300 text-xs font-semibold hover:bg-gray-400 transition text-gray-900"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex-1 px-2 py-1 rounded-lg bg-red-500 text-xs font-semibold hover:bg-red-400 transition text-white"
                        >
                            Delete
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </section>
        </div>
      )}

      {mode === "Activity Log" && (
         <div 
            className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
         >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-700">System Logs</h3>
                <button 
                    onClick={fetchHistory} 
                    className="text-xs text-blue-600 hover:underline"
                >
                    Refresh Logs
                </button>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-gray-800 uppercase font-bold border-b border-gray-300 sticky top-0">
                        <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {historyLoading && (
                            <tr><td colSpan="4" className="p-6 text-center text-gray-500">Loading history...</td></tr>
                        )}
                        {!historyLoading && logs.length === 0 && (
                            <tr><td colSpan="4" className="p-6 text-center text-gray-500">No history found.</td></tr>
                        )}
                        {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition">
                            <td className="p-4 whitespace-nowrap text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="p-4">
                                <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-bold">{log.user}</span>
                            </td>
                            <td className="p-4">
                                <span 
                                    className="font-bold text-xs px-2 py-1 rounded border"
                                    style={{ color: 'var(--color-accent-utility)', borderColor: 'var(--color-accent-utility)' }}
                                >
                                    {log.action}
                                </span>
                            </td>
                            <td className="p-4 text-gray-900 font-medium">{log.details}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      )}

    </div>
  );
}