import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, X } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";

const DEFAULT_ICONS = [
  { id: "pool", label: "Swimming Pool", emoji: "🏊" },
  { id: "spa", label: "Spa", emoji: "🌿" },
  { id: "parking", label: "Free Parking", emoji: "🅿️" },
  { id: "meal", label: "Meal Plan", emoji: "🍽️" },
  { id: "wifi", label: "Free Wi-Fi", emoji: "📶" },
  { id: "gym", label: "Gym", emoji: "💪" },
  { id: "bar", label: "Bar / Lounge", emoji: "🍹" },
  { id: "ac", label: "Air Conditioning", emoji: "❄️" },
  { id: "pets", label: "Pet Friendly", emoji: "🐾" },
  { id: "laundry", label: "Laundry", emoji: "👕" },
  { id: "concierge", label: "Concierge", emoji: "🛎️" },
  { id: "shuttle", label: "Airport Shuttle", emoji: "🚐" },
  { id: "beach", label: "Beach Access", emoji: "🏖️" },
  { id: "childcare", label: "Childcare", emoji: "🧒" },
  { id: "rooftop", label: "Rooftop", emoji: "🌆" },
  { id: "breakfast", label: "Breakfast", emoji: "🥐" },
  { id: "minibar", label: "Mini Bar", emoji: "🧊" },
  { id: "safe", label: "In-Room Safe", emoji: "🔒" },
];

export default function HotelIconsStep() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(() => {
    const saved = JSON.parse(
      sessionStorage.getItem("hotel_details_icons") || "null",
    );
    return new Set(saved?.selectedIcons || []);
  });
  const [icons, setIcons] = useState(() => {
    const saved = JSON.parse(
      sessionStorage.getItem("hotel_details_icons") || "null",
    );
    return saved?.allIcons || DEFAULT_ICONS;
  });
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setError("");
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const id = `custom_${Date.now()}`;
    const newIcon = { id, label: newLabel.trim(), emoji: "✨" };
    setIcons((prev) => [...prev, newIcon]);
    setSelected((prev) => new Set([...prev, id]));
    setNewLabel("");
    setShowAddPanel(false);
  };

  const handleNext = () => {
    if (selected.size === 0) {
      setError("Please select at least one amenity");
      return;
    }
    sessionStorage.setItem(
      "hotel_details_icons",
      JSON.stringify({ selectedIcons: [...selected], allIcons: icons }),
    );
    navigate("/hotel/details/policy");
  };

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Hotel Amenities
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Select all amenities & services available at your property
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(29,78,216,0.1)",
                color: "var(--sidebar-active-text)",
              }}
            >
              {selected.size} selected
            </span>
          )}
          <button
            onClick={() => setShowAddPanel((v) => !v)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-all"
            style={{
              backgroundColor: showAddPanel
                ? "var(--bg-raised)"
                : "var(--sidebar-active-text)",
              color: showAddPanel ? "var(--text-secondary)" : "#fff",
              border: `1px solid ${showAddPanel ? "var(--border)" : "var(--sidebar-active-text)"}`,
            }}
          >
            {showAddPanel ? <X size={14} /> : <Plus size={14} />}
            {showAddPanel ? "Cancel" : "Add Custom"}
          </button>
        </div>
      </div>

      {/* Add custom icon panel */}
      {showAddPanel && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px dashed var(--border)",
          }}
        >
          <span className="text-2xl">✨</span>
          <input
            className="input flex-1"
            placeholder="Custom amenity name (e.g. Private Cinema)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="btn btn-primary px-4 py-2 rounded-xl text-sm"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}
          >
            Add
          </button>
        </div>
      )}

      {/* Icons grid */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
          {icons.map((icon) => {
            const isSelected = selected.has(icon.id);
            return (
              <button
                key={icon.id}
                onClick={() => toggle(icon.id)}
                className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(29,78,216,0.08)"
                    : "transparent",
                  border: `1.5px solid ${isSelected ? "var(--sidebar-active-text)" : "transparent"}`,
                }}
              >
                <div
                  className="h-14 w-14 flex items-center justify-center rounded-full text-2xl transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(29,78,216,0.15)"
                      : "var(--bg-raised)",
                    boxShadow: isSelected
                      ? "0 0 0 3px rgba(29,78,216,0.12)"
                      : "none",
                  }}
                >
                  {icon.emoji}
                </div>
                <span
                  className="text-[11px] text-center leading-tight font-medium w-full truncate px-1"
                  style={{
                    color: isSelected
                      ? "var(--sidebar-active-text)"
                      : "var(--text-secondary)",
                  }}
                >
                  {icon.label}
                </span>
                <div
                  className="h-4 w-4 flex items-center justify-center rounded border transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--sidebar-active-text)"
                      : "var(--bg-surface)",
                    borderColor: isSelected
                      ? "var(--sidebar-active-text)"
                      : "var(--border)",
                  }}
                >
                  {isSelected && (
                    <Check size={10} className="text-white" strokeWidth={3} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="input-error mb-3">{error}</p>}

      <button
        onClick={handleNext}
        className="btn btn-primary w-full text-base py-3 rounded-2xl"
        style={{ backgroundColor: "var(--sidebar-active-text)" }}
      >
        Next → Policy
      </button>
    </div>
  );
}
