import { useState } from "react";
import { Hotel, Users, Baby, Minus, Plus } from "lucide-react";

export default function SearchGuestsPicker({ open, onClose, initial, onConfirm }) {
  const [rooms, setRooms] = useState(initial?.rooms ?? 1);
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);

  if (!open) return null;

  const Row = ({ icon: Icon, label, value, min, max, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0", borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <Icon size={22} style={{ color: "#173f78" }} />
        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111827" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: value <= min ? "default" : "pointer", opacity: value <= min ? 0.4 : 1 }}>
          <Minus size={16} style={{ color: "#374151" }} />
        </button>
        <span style={{ minWidth: "28px", textAlign: "center", fontWeight: 900, fontSize: "1.1rem", color: "#111827" }}>{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: value >= max ? "default" : "pointer", opacity: value >= max ? 0.4 : 1 }}>
          <Plus size={16} style={{ color: "#374151" }} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", width: "100%", maxWidth: "480px",
          background: "white", borderRadius: "1.5rem 1.5rem 0 0",
          fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
          animation: "sgp-up 0.3s ease",
        }}
      >
        <style>{`@keyframes sgp-up { from { transform: translateY(100%); } to { transform: none; } }`}</style>

        <div style={{ padding: "1.4rem 1.2rem 0.4rem" }}>
          <h3 style={{ margin: 0, textAlign: "center", fontWeight: 900, fontSize: "1.1rem", color: "#111827" }}>الغرف والضيوف</h3>
        </div>

        <div style={{ padding: "0.4rem 1.4rem 0.8rem" }}>
          <Row icon={Hotel} label="الغرف" value={rooms} min={1} max={10} onChange={setRooms} />
          <Row icon={Users} label="البالغين" value={adults} min={1} max={20} onChange={setAdults} />
          <Row icon={Baby} label="الأطفال" value={children} min={0} max={10} onChange={setChildren} />
        </div>

        <div style={{ padding: "0.5rem 1.2rem 1.4rem" }}>
          <button
            type="button"
            onClick={() => onConfirm({ rooms, adults, children })}
            style={{
              width: "100%", padding: "0.9rem", border: "none", borderRadius: "0.85rem",
              backgroundColor: "#173f78", color: "white", fontWeight: 800, fontSize: "1rem",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
