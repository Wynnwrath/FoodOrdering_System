import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";
const CUSTOM_VALUE = "__custom";

export default function ManagerPage() {
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

  // Fetch menu items
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

  useEffect(() => {
    fetchMenu();
  }, []);

  // Categories (defaults + menu)
  const categories = useMemo(() => {
    const set = new Set(["Burgers", "Pizza", "Salads", "Drinks", "Desserts"]);
    menu.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menu]);

  // Convert image file to base64
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Save item (create/update)
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
    <div className="h-full w-full bg-slate-900 text-white p-4 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manager – Menu Management</h1>
          <p className="text-sm text-slate-400">
            Add, edit, or remove items from the menu.
          </p>
        </div>
        <button
          onClick={fetchMenu}
          className="px-4 py-2 rounded-lg bg-sky-500 text-sm font-semibold hover:bg-sky-400 transition"
        >
          Refresh Menu
        </button>
      </header>

      {/* Form */}
      <section className="bg-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-end gap-3">
        {/* Name */}
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring focus:ring-sky-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bacon Burger"
          />
        </div>

        {/* Price */}
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring focus:ring-sky-500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 9.99"
          />
        </div>

        {/* Category */}
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Category</label>
          <select
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring focus:ring-sky-500"
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
              className="mt-2 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring focus:ring-sky-500"
              placeholder="Enter new category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}
        </div>

        {/* Image */}
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Image</label>
          <input type="file" accept="image/*" className="w-full text-xs text-slate-300" onChange={handleImageChange} />
          {(imagePreview || imageUrl) && (
            <div className="mt-2 w-full h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center">
              <img src={imagePreview || imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveItem}
            className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-sm font-semibold hover:bg-emerald-400 transition"
          >
            {editingId === null ? "Add Item" : "Save Changes"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-lg bg-slate-600 text-sm font-semibold hover:bg-slate-500 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* Menu Items */}
      <section className="flex-1 overflow-auto">
        {loading && <p className="text-slate-300 text-sm">Loading menu...</p>}
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        {!loading && menu.length === 0 ? (
          <p className="text-slate-400 text-sm">No menu items yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menu.map((item) => (
              <div key={item.id} className="bg-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500">No image</span>
                  )}
                </div>
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-slate-300">{item.category}</p>
                <p className="text-sm text-amber-300">${Number(item.price).toFixed(2)}</p>
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
                    className="flex-1 px-2 py-1 rounded-lg bg-slate-600 text-xs font-semibold hover:bg-slate-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex-1 px-2 py-1 rounded-lg bg-red-500 text-xs font-semibold hover:bg-red-400 transition"
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
  );
}
