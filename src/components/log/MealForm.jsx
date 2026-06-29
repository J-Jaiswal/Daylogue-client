import { useState } from "react";
import toast from "react-hot-toast";

const FOOD_CATEGORIES = [
  { value: "breakfast",  label: "Breakfast",  icon: "🍳" },
  { value: "lunch",      label: "Lunch",      icon: "🍛" },
  { value: "dinner",     label: "Dinner",     icon: "🍽️" },
  { value: "snacks",     label: "Snacks",     icon: "🍎" },
  { value: "junk_food",  label: "Junk food",  icon: "🍔" },
  { value: "cheat_meal", label: "Cheat meal", icon: "🍕" },
];

const DRINK_CATEGORIES = [
  { value: "water",         label: "Water",         icon: "💧" },
  { value: "coffee",        label: "Coffee",        icon: "☕" },
  { value: "tea",           label: "Tea",           icon: "🍵" },
  { value: "juice",         label: "Juice",         icon: "🥤" },
  { value: "protein_shake", label: "Protein shake", icon: "🧃" },
  { value: "alcohol",       label: "Alcohol",       icon: "🍺" },
  { value: "soda",          label: "Soda",          icon: "🥃" },
  { value: "custom",        label: "Custom",        icon: "🍹" },
];

const catMeta = (val) => {
  const all = [...FOOD_CATEGORIES, ...DRINK_CATEGORIES];
  return all.find((c) => c.value === val) || { icon: "🍽", label: val };
};

const emptyItem = (isDrink = false) => ({
  id: Date.now() + Math.random(),
  name: "",
  amount: "",
  times: isDrink ? 1 : undefined,
});

export default function MealForm({ meals, onSave, isPending }) {
  const [catGroup, setCatGroup] = useState("food"); // "food" or "drinks"
  const [category, setCategory] = useState("breakfast");
  const [items, setItems]       = useState([emptyItem(false)]);

  const isDrink = catGroup === "drinks";

  // Reactive apply button label — updates every render based on current `category`
  const activeMeta = category ? catMeta(category) : null;
  const applyButtonLabel = activeMeta
    ? `Apply ${activeMeta.label.toLowerCase()}`
    : "Apply entry";

  const handleGroupToggle = (group) => {
    setCatGroup(group);
    setCategory(group === "food" ? "breakfast" : "water");
    setItems([emptyItem(group === "drinks")]);
  };

  const addItem    = () => setItems([...items, emptyItem(isDrink)]);
  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (id, field, value) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleSave = () => {
    const valid = items.every((i) => {
      if (!i.amount.trim()) return false;
      if (!isDrink && !i.name.trim()) return false;
      return true;
    });
    if (!valid) {
      toast.error(isDrink ? "Fill in quantity for all entries" : "Fill in item name and amount");
      return;
    }

    const meta = catMeta(category);
    const meal = {
      category,
      items: items.map((i) => {
        const itemPayload = {
          name: i.name.trim() || meta.label,
          amount: i.amount.trim(),
        };
        if (isDrink) {
          itemPayload.times = i.times ? Math.max(1, parseInt(i.times, 10) || 1) : 1;
        }
        return itemPayload;
      }),
    };

    // Immediately update local state via onSave — removes tag from list too
    onSave([...(meals || []), meal]);
    setItems([emptyItem(isDrink)]);
    toast.success(`${meta.label} saved`);
  };

  // Remove a logged meal entry from local state immediately
  const removeMeal = (idx) => {
    const updated = (meals || []).filter((_, i) => i !== idx);
    onSave(updated);
  };

  const handleCancel = () => {
    setItems([emptyItem(catGroup === "drinks")]);
    setCategory(catGroup === "food" ? "breakfast" : "water");
  };

  return (
    <div className="meal-form-container">
      {/* Section 1 — Logged today list */}
      <div className="section-label">LOGGED TODAY</div>
      {!meals || meals.length === 0 ? (
        <div style={{ color: "var(--text-3)", fontSize: "13.5px", fontStyle: "italic", padding: "4px 0 16px" }}>
          No meals logged yet today.
        </div>
      ) : (
        <div style={{ marginBottom: "16px" }}>
          {meals.map((m, idx) => {
            const mc = catMeta(m.category);
            const itemsStr = m.items
              .map((it) => {
                const isPlaceholder =
                  it.name.toLowerCase() === mc.label.toLowerCase();
                const suffix = it.times && it.times > 1 ? ` × ${it.times}` : "";
                return isPlaceholder ? `${it.amount}${suffix}` : `${it.name} (${it.amount}${suffix})`;
              })
              .join(", ");
            return (
              <div key={idx} className="log-entry">
                <div className="log-entry-left">
                  <span className="log-entry-icon">{mc.icon}</span>
                  <div>
                    <div className="log-entry-name">{mc.label}</div>
                    <div className="log-entry-meta">{itemsStr}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rm-btn"
                  onClick={() => removeMeal(idx)}
                  title="Remove entry"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Section 2 — Add entry */}
      <div className="input-zone" style={{ "--zc": "#1D9E75" }}>
        <div className="zone-header">
          <span className="zone-label-text">ADD ENTRY</span>
        </div>

        {/* Food / Drinks toggle sub-tabs */}
        <div className="food-sub-tabs">
          <button
            type="button"
            className={`food-sub-tab ${catGroup === "food" ? "active" : ""}`}
            onClick={() => handleGroupToggle("food")}
          >
            🍱 Food
          </button>
          <button
            type="button"
            className={`food-sub-tab ${catGroup === "drinks" ? "active" : ""}`}
            onClick={() => handleGroupToggle("drinks")}
          >
            💧 Drinks
          </button>
        </div>

        {/* Category chips selector */}
        <div className="meal-chips">
          {catGroup === "food"
            ? FOOD_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`meal-chip ${category === c.value ? "sel" : ""}`}
                  onClick={() => setCategory(c.value)}
                >
                  {c.icon} {c.label}
                </button>
              ))
            : DRINK_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`meal-chip ${category === c.value ? "sel" : ""}`}
                  onClick={() => setCategory(c.value)}
                >
                  {c.icon} {c.label}
                </button>
              ))}
        </div>

        {/* Food Items list headers */}
        <div className="food-items-header">
          <span className="food-items-label">
            {isDrink ? "DRINK ITEMS" : "FOOD ITEMS"}
          </span>
          <button
            type="button"
            className="btn-ghost"
            style={{ "--zc": "#1D9E75" }}
            onClick={addItem}
          >
            + Add item
          </button>
        </div>

        {/* Food item rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
          {items.map((item) => (
            <div key={item.id} className="food-item-block">
              {/* Row 1: Name and Delete Cross Icon */}
              <div className="food-item-row-1">
                <div className="field-wrap" style={{ flex: 1 }}>
                  <div className="field-label">NAME</div>
                  <input
                    type="text"
                    placeholder={
                      isDrink ? "e.g. Water, Evian (optional)" : "e.g. Chicken breast"
                    }
                    value={item.name}
                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="rm-btn"
                  style={{ paddingBottom: "8px" }}
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  title="Remove item"
                >
                  ×
                </button>
              </div>

              {/* Row 2: Serving (+ Times for Drinks) */}
              <div className="food-item-row-2">
                <div className="field-wrap" style={{ width: "140px", flex: "none" }}>
                  <div className="field-label">SERVING</div>
                  <input
                    type="text"
                    placeholder={isDrink ? "e.g. 500ml" : "e.g. 300g"}
                    value={item.amount}
                    onChange={(e) => updateItem(item.id, "amount", e.target.value)}
                  />
                </div>
                {isDrink && (
                  <div className="field-wrap" style={{ width: "80px", flex: "none" }}>
                    <div className="field-label">TIMES</div>
                    <input
                      type="number"
                      min="1"
                      placeholder="times"
                      value={item.times === undefined || item.times === null ? "" : item.times}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateItem(item.id, "times", isNaN(val) ? "" : val);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="action-row">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ "--zc": "#1D9E75", background: "#1D9E75", color: "#fff" }}
            onClick={handleSave}
            disabled={isPending}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
