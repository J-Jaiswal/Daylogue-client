import { useState } from "react";
import toast from "react-hot-toast";

const CATEGORIES = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
  "junk_food",
  "cheat_meal",
];

const categoryIcons = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌆",
  snacks: "🍎",
  junk_food: "🍔",
  cheat_meal: "🍕",
};

const emptyItem = () => ({ id: Date.now(), name: "", amount: "" });

export default function MealForm({ meals, onSave }) {
  const [category, setCategory] = useState("breakfast");
  const [items, setItems] = useState([emptyItem()]);

  const addItem = () => setItems([...items, emptyItem()]);

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleSave = () => {
    const valid = items.every((i) => i.name.trim() && i.amount.trim());
    if (!valid) {
      toast.error("Fill in all meal item fields");
      return;
    }

    const meal = {
      category,
      items: items.map((item) => ({
        name: item.name.trim(),
        amount: item.amount.trim(),
      })),
    };

    onSave([...(meals || []), meal]);

    // reset
    setCategory("breakfast");
    setItems([emptyItem()]);
    toast.success("Meal added");
  };

  return (
    <div className="meal-section-card">
      <span className="meal-card-header-label">NUTRITION</span>

      {/* existing meals summary */}
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

      {/* category selector */}
      <div className="meal-input-group">
        <span className="meal-input-label">MEAL TYPE</span>
        <div className="meal-category-selector-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`meal-category-btn ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              <span className="meal-cat-icon">{categoryIcons[c]}</span>
              <span className="meal-cat-name">{c.replace("_", " ").toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* items */}
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
              className="meal-item-text-input"
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
