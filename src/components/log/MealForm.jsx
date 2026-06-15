import { useState } from "react";
import toast from "react-hot-toast";

const FOOD_CATEGORIES = [
  { value: "breakfast",  label: "Breakfast",  icon: "🌅" },
  { value: "lunch",      label: "Lunch",      icon: "☀️" },
  { value: "dinner",     label: "Dinner",     icon: "🌆" },
  { value: "snacks",     label: "Snacks",     icon: "🍎" },
  { value: "junk_food",  label: "Junk Food",  icon: "🍔" },
  { value: "cheat_meal", label: "Cheat Meal", icon: "🍕" },
];

const DRINK_CATEGORIES = [
  { value: "water",         label: "Water",         icon: "💧" },
  { value: "coffee",        label: "Coffee",        icon: "☕" },
  { value: "tea",           label: "Tea",           icon: "🍵" },
  { value: "juice",         label: "Juice",         icon: "🥤" },
  { value: "protein_shake", label: "Protein Shake", icon: "🧃" },
  { value: "alcohol",       label: "Alcohol",       icon: "🍺" },
  { value: "soda",          label: "Soda",          icon: "🥃" },
];

const catMeta = (val) => {
  const all = [...FOOD_CATEGORIES, ...DRINK_CATEGORIES];
  return all.find((c) => c.value === val) || { icon: "🍽", label: val };
};

const emptyItem = () => ({ id: Date.now() + Math.random(), name: "", amount: "" });

export default function MealForm({ meals, onSave, isPending }) {
  const [catGroup, setCatGroup] = useState("food"); // "food" or "drinks"
  const [category, setCategory] = useState("breakfast");
  const [items, setItems]       = useState([emptyItem()]);

  const isDrink = catGroup === "drinks";
  const meta    = catMeta(category);

  const handleGroupToggle = (group) => {
    setCatGroup(group);
    setCategory(group === "food" ? "breakfast" : "water");
    setItems([emptyItem()]);
  };

  const addItem    = () => setItems([...items, emptyItem()]);
  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (id, field, value) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleSave = () => {
    const valid = items.every((i) => {
      if (!i.amount.trim()) return false;         // amount always required
      if (!isDrink && !i.name.trim()) return false; // name required for food
      return true;
    });
    if (!valid) {
      toast.error(isDrink ? "Fill in quantity for all entries" : "Fill in item name and amount");
      return;
    }

    const meal = {
      category,
      items: items.map((i) => ({
        name: i.name.trim() || meta.label,
        amount: i.amount.trim(),
      })),
    };

    onSave([...(meals || []), meal]);
    setItems([emptyItem()]);
    toast.success(`${meta.label} saved`);
  };

  const removeMeal = (idx) => {
    onSave((meals || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="meal-form-wrap">
      <h3 className="form-card-title">Nutrition & Hydration</h3>

      {/* Removable chips at the top */}
      {meals?.length > 0 && (
        <div className="saved-chips-container">
          <h4 className="saved-title-label">LOGGED TODAY</h4>
          <div className="saved-chips-list">
            {meals.map((m, idx) => {
              const mc = catMeta(m.category);
              const itemsStr = m.items.map((it) => {
                const isPlaceholder = it.name.toLowerCase() === mc.label.toLowerCase();
                return isPlaceholder ? it.amount : `${it.name} (${it.amount})`;
              }).join(", ");
              return (
                <div key={idx} className="meal-saved-chip">
                  <span className="chip-icon">{mc.icon}</span>
                  <span className="chip-text">
                    <strong>{mc.label}</strong> · {itemsStr}
                  </span>
                  <button
                    type="button"
                    className="chip-remove-btn"
                    onClick={() => removeMeal(idx)}
                    title="Remove entry"
                  >✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tappable Segmented Controller for Food vs Drinks */}
      <div className="meal-group-segmented">
        <button
          type="button"
          className={`segment-btn ${catGroup === "food" ? "active" : ""}`}
          onClick={() => handleGroupToggle("food")}
        >
          🥗 Food
        </button>
        <button
          type="button"
          className={`segment-btn ${catGroup === "drinks" ? "active" : ""}`}
          onClick={() => handleGroupToggle("drinks")}
        >
          💧 Drinks
        </button>
      </div>

      {/* Icon Tab Row (Always visible tabs) */}
      <div className="category-tabs-row">
        {catGroup === "food" ? (
          FOOD_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`category-tab-btn ${category === c.value ? "active" : ""}`}
              onClick={() => setCategory(c.value)}
            >
              <span className="tab-icon">{c.icon}</span>
              <span className="tab-label">{c.label}</span>
            </button>
          ))
        ) : (
          DRINK_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`category-tab-btn ${category === c.value ? "active" : ""}`}
              onClick={() => setCategory(c.value)}
            >
              <span className="tab-icon">{c.icon}</span>
              <span className="tab-label">{c.label}</span>
            </button>
          ))
        )}
      </div>

      {/* Input Rows */}
      <div className="meal-inputs-container">
        <h4 className="section-label-header">
          {isDrink ? "DRINK QUANTITIES" : "FOOD ITEMS"}
        </h4>
        
        <div className="meal-items-list">
          {items.map((item) => (
            <div key={item.id} className="meal-input-row">
              {/* Item Name */}
              <div className="input-col col-main">
                <span className="mobile-field-label">
                  {isDrink ? "BRAND / TYPE (OPTIONAL)" : "ITEM NAME"}
                </span>
                <input
                  type="text"
                  className="styled-table-input"
                  placeholder={isDrink ? "e.g. Evian (optional)" : "e.g. Chicken breast"}
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                />
              </div>

              {/* Amount / Quantity */}
              <div className="input-col col-amount">
                <span className="mobile-field-label">
                  {isDrink ? "QUANTITY" : "AMOUNT"}
                </span>
                <input
                  type="text"
                  className="styled-table-input"
                  placeholder={isDrink ? "e.g. 500ml" : "e.g. 300g"}
                  value={item.amount}
                  onChange={(e) => updateItem(item.id, "amount", e.target.value)}
                />
              </div>

              {/* Delete row button */}
              <div className="input-col col-action">
                <button
                  type="button"
                  className="row-delete-btn"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="meal-form-actions">
        <button
          type="button"
          className="dashed-ghost-add-btn"
          onClick={addItem}
        >
          + {isDrink ? "Add Cup / serving" : "Add Item"}
        </button>
        <button
          type="button"
          className="solid-purple-save-btn"
          onClick={handleSave}
          disabled={isPending}
        >
          Apply {meta.label}
        </button>
      </div>
    </div>
  );
}
