import { useState } from "react";
import toast from "react-hot-toast";

const DRINK_CATEGORIES = [
  { value: "water",    label: "Water",   icon: "💧" },
  { value: "coffee",   label: "Coffee",  icon: "☕" },
  { value: "tea",      label: "Tea",     icon: "🍵" },
  { value: "juice",    label: "Juice",   icon: "🥤" },
  { value: "protein",  label: "Protein", icon: "🧃" },
  { value: "alcohol",  label: "Alcohol", icon: "🍺" },
  { value: "soda",     label: "Soda",    icon: "🥃" },
  { value: "other",    label: "Other",   icon: "🫗" },
];

const emptyDrink = () => ({
  id: Date.now() + Math.random(),
  category: "water",
  quantity: "",
  note: "",
});

export default function DrinksForm({ drinks, onSave }) {
  const [items, setItems] = useState([emptyDrink()]);

  const addItem = () => setItems([...items, emptyDrink()]);

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id, field, value) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleSave = () => {
    const valid = items.every((i) => i.quantity.trim());
    if (!valid) {
      toast.error("Fill in quantity for all drinks");
      return;
    }

    const newEntries = items.map((i) => ({
      category: i.category,
      quantity: i.quantity.trim(),
      note: i.note.trim(),
    }));

    onSave([...(drinks || []), ...newEntries]);
    setItems([emptyDrink()]);
    toast.success("Drinks logged");
  };

  // ── Preview ─────────────────────────────────────────────────────────────
  const hasPreview = items.some((i) => i.quantity.trim());

  return (
    <div className="drinks-section-card">
      <span className="drinks-card-header-label">HYDRATION & DRINKS</span>

      {/* Saved drinks badges */}
      {drinks?.length > 0 && (
        <div className="drinks-saved-wrap">
          {drinks.map((d, i) => {
            const meta = DRINK_CATEGORIES.find((c) => c.value === d.category);
            return (
              <span key={i} className="drink-saved-badge">
                {meta?.icon} {meta?.label || d.category} · {d.quantity}
              </span>
            );
          })}
        </div>
      )}

      {/* Entry rows */}
      <div className="drinks-items-list">
        {items.map((item) => {
          const meta = DRINK_CATEGORIES.find((c) => c.value === item.category);
          return (
            <div key={item.id} className="drink-item-row">
              {/* Category dropdown */}
              <div className="drink-cat-select-wrap">
                <span className="drink-cat-icon-preview">{meta?.icon}</span>
                <select
                  className="drink-category-select"
                  value={item.category}
                  onChange={(e) => updateItem(item.id, "category", e.target.value)}
                >
                  {DRINK_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <input
                type="text"
                className="drink-qty-input"
                placeholder="Qty (e.g. 500ml, 2 cups)"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
              />

              {/* Optional note */}
              <input
                type="text"
                className="drink-note-input"
                placeholder="Note (optional)"
                value={item.note}
                onChange={(e) => updateItem(item.id, "note", e.target.value)}
              />

              <button
                type="button"
                className="drink-remove-btn"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Live preview */}
      {hasPreview && (
        <div className="log-preview-card">
          <span className="log-preview-label">PREVIEW</span>
          <div className="log-preview-chips">
            {items
              .filter((i) => i.quantity.trim())
              .map((i, idx) => {
                const meta = DRINK_CATEGORIES.find((c) => c.value === i.category);
                return (
                  <span key={idx} className="log-preview-chip drinks-chip">
                    {meta?.icon} {meta?.label} · {i.quantity}
                    {i.note && <em> ({i.note})</em>}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="drinks-action-buttons">
        <button type="button" className="drink-add-btn" onClick={addItem}>
          + Add Another
        </button>
        <button type="button" className="drink-save-btn" onClick={handleSave}>
          Save Drinks
        </button>
      </div>
    </div>
  );
}
