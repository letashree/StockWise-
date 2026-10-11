import { useCallback, useEffect, useMemo, useState } from "react";
import { createItem, deleteItem, getItems, updateItem } from "./api.js";

const emptyForm = {
  name: "", sku: "", category: "", quantity: "0", price: "", lowStockThreshold: "5"
};
const money = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong";
}

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getItems({
        search: search.trim() || undefined,
        category: category || undefined,
        lowStock: lowStockOnly ? "true" : undefined
      });
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, category, lowStockOnly]);

  useEffect(() => {
    const timer = setTimeout(() => loadItems(), 250);
    return () => clearTimeout(timer);
  }, [loadItems]);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort(),
    [items]
  );

  const stats = useMemo(() => ({
    products: items.length,
    units: items.reduce((sum, item) => sum + item.quantity, 0),
    value: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    low: items.filter((item) => item.quantity <= item.lowStockThreshold).length
  }), [items]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: String(item.quantity),
      price: String(item.price),
      lowStockThreshold: String(item.lowStockThreshold)
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    const quantity = Number(form.quantity);
    const price = Number(form.price);
    const lowStockThreshold = Number(form.lowStockThreshold);
    if (!form.name.trim() || !form.sku.trim() || !form.category.trim()) {
      setError("Name, SKU, and category are required.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(lowStockThreshold) || lowStockThreshold < 0 || !Number.isFinite(price) || price < 0 || form.price === "") {
      setError("Enter a non-negative whole quantity and threshold, and a valid non-negative price.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category.trim(),
      quantity,
      price,
      lowStockThreshold
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateItem(editingId, payload);
        setNotice("Item updated successfully.");
      } else {
        await createItem(payload);
        setNotice("Item added successfully.");
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await deleteItem(item._id);
      setNotice("Item deleted successfully.");
      await loadItems();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">S</div>
        <div><p className="eyebrow">INVENTORY WORKSPACE</p><h1>StockWise</h1></div>
        <span className="live-pill"><span /> Live inventory</span>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Keep your stock in check.</h2>
          <p className="muted">Track products, monitor low stock, and keep your inventory organized.</p>
        </div>
      </section>

      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert success" role="status">{notice}</div>}

      <section className="stats-grid" aria-label="Inventory summary">
        <Stat label="Products shown" value={stats.products} note="Matching current filters" />
        <Stat label="Units in stock" value={stats.units.toLocaleString("en-IN")} note="Across shown products" />
        <Stat label="Stock value" value={money(stats.value)} note="Quantity × unit price" />
        <Stat label="Low-stock items" value={stats.low} note="At or below threshold" warning={stats.low > 0} />
      </section>

      <section className="workspace">
        <div className="panel form-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">{editingId ? "UPDATE PRODUCT" : "PRODUCT MANAGEMENT"}</p><h3>{editingId ? "Edit item" : "Add an item"}</h3></div>
            {editingId && <button className="text-button" type="button" onClick={resetForm}>Cancel edit</button>}
          </div>
          <form onSubmit={handleSubmit}>
            <label>Item name<input name="name" value={form.name} onChange={updateField} placeholder="e.g. Wireless Mouse" maxLength="100" required /></label>
            <div className="two-col">
              <label>SKU<input name="sku" value={form.sku} onChange={updateField} placeholder="e.g. WM-001" maxLength="40" required /></label>
              <label>Category<input name="category" value={form.category} onChange={updateField} placeholder="e.g. Accessories" maxLength="60" required /></label>
            </div>
            <div className="two-col">
              <label>Quantity<input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={updateField} required /></label>
              <label>Unit price (₹)<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} placeholder="799.00" required /></label>
            </div>
            <label>Low-stock alert threshold<input name="lowStockThreshold" type="number" min="0" step="1" value={form.lowStockThreshold} onChange={updateField} required /><small>Item is flagged when quantity is at or below this number.</small></label>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Add product"}</button>
          </form>
        </div>

        <div className="panel inventory-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">YOUR CATALOG</p><h3>Inventory items</h3></div>
            <span className="count-pill">{items.length} shown</span>
          </div>
          <div className="filters">
            <input aria-label="Search inventory" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, SKU, category…" />
            <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <label className="check-filter"><input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} /> Low stock only</label>
          </div>

          {loading ? <div className="empty-state">Loading inventory…</div> :
            items.length === 0 ? <div className="empty-state"><div className="empty-icon">□</div><h4>No items found</h4><p>Try another search or add your first product.</p></div> :
            <div className="table-wrap"><table>
              <thead><tr><th>Product</th><th>Category</th><th>Quantity</th><th>Unit price</th><th>Stock value</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{items.map((item) => {
                const isLow = item.quantity <= item.lowStockThreshold;
                return <tr key={item._id}>
                  <td><strong>{item.name}</strong><small className="sku">{item.sku}</small></td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{money(item.price)}</td>
                  <td>{money(item.quantity * item.price)}</td>
                  <td><span className={`status ${isLow ? "status-low" : "status-ok"}`}>{isLow ? "Low stock" : "In stock"}</span></td>
                  <td><div className="actions"><button type="button" className="text-button" onClick={() => startEdit(item)}>Edit</button><button type="button" className="text-button danger-text" onClick={() => handleDelete(item)}>Delete</button></div></td>
                </tr>;
              })}</tbody>
            </table></div>
          }
          <p className="footnote">Data is saved in MongoDB. Dashboard totals reflect the items currently shown after filtering.</p>
        </div>
      </section>
      <footer>StockWise · MERN inventory assessment project</footer>
    </main>
  );
}

function Stat({ label, value, note, warning = false }) {
  return <article className={`stat-card ${warning ? "stat-warning" : ""}`}><p>{label}</p><strong>{value}</strong><small>{note}</small></article>;
}
