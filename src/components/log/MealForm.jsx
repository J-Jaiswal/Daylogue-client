import { useState } from "react";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "breakfast",  label: "🌅 Breakfast" },
  { value: "lunch",      label: "☀️ Lunch" },
  { value: "dinner",     label: "🌆 Dinner" },
  { value: "snacks",     label: "🍎 Snacks" },
  { value: "junk_food",  label: "🍔 Junk Food" },
  { value: "cheat_meal", label: "🍕 Cheat Meal" },
];

const categoryIcons = {
  breakfast: "🌅", lunch: "☀️", dinner: "🌆",
  snacks: "🍎", junk_food: "🍔", cheat_meal: "🍕",
};

const emptyItem = () => ({ id: Date.now() + Math.random(), name: "", amount: "" });

export default function MealForm({ meals, onSave }) {
  const [category, setCategory] = useState("breakfast");
  const [items, setItems] = useState([emptyItem()]);

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (id, field, value) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleSave = () => {
    const valid = items.every((i) => i.name.trim() && i.amount.trim());
    if (!valid) {
      toast.error("Fill in all meal item fields");
      return;
    }
    const meal = {
      category,
      items: items.map((item) => ({ name: item.name.trim(), amount: item.amount.trim() })),
    };
    onSave([...(meals || []), meal]);
    setCategory("breakfast");
    setItems([emptyItem()]);
    toast.success("Meal added");
  };

  const selectedCat = CATEGORIES.find((c) => c.value === category);
  const hasPreview = items.some((i) => i.name.trim());

  return (
    <div className="meal-section-card">
      <span className="meal-card-header-label">NUTRITION</span>

      {/* Saved meal badges */}
      {meals?.length > 0 && (
        <div className="meal-sessions-summary-wrap">
          {meals.map((m, i) => (
            <div key={i} className="meal-session-badge">
              {categoryIcons[m.category]} {m.category.replace("_", " ").toUpperCase()} ·{" "}
              {m.items.length} ITEM{m.items.length > 1 ? "S" : ""}
            </div>
          ))}
        </div>
      )}

      {/* Meal type — dropdown */}
      <div className="meal-input-group">
        <span className="meal-input-label">MEAL TYPE</span>
        <div className="meal-type-dropdown-wrap">
          <span className="meal-type-icon-preview">{selectedCat?.label.split(" ")[0]}</span>
          <select
            className="meal-type-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Food items */}
      <div className="meal-items-list-container">
        {items.map((item) => (
          <div key={item.id} className="meal-item-row-card">
            <input
              type="text"
              placeholder="Food name (e.g. Chicken)"
              value={item.name}
              className="meal-item-text-input"
              onChange={(e) => updateItem(item.id, "name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Amount (e.g. 300g)"
              value={item.amount}
              className="meal-item-text-input meal-item-amount-input"
              onChange={(e) => updateItem(item.id, "amount", e.target.value)}
            />
            <button
              type="button"
              className="meal-item-remove-btn"
              onClick={() => removeItem(item.id)}
              disabled={items.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Live preview */}
      {hasPreview && (
        <div className="log-preview-card">
          <span className="log-preview-label">PREVIEW</span>
          <div className="log-preview-meal-header">
            <span className="log-preview-meal-cat">
              {selectedCat?.label}
            </span>
          </div>
          <div className="log-preview-chips">
            {items
              .filter((i) => i.name.trim())
              .map((i, idx) => (
                <span key={idx} className="log-preview-chip meal-chip">
                  {i.name}
                  {i.amount && <em> · {i.amount}</em>}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="meal-action-buttons">
        <button type="button" className="meal-add-item-btn" onClick={addItem}>
          + Add Item
        </button>
        <button type="button" className="meal-save-btn" onClick={handleSave}>
          Save Meal
        </button>
      </div>
    </div>
  );
}
