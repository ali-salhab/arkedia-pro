import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowLeftRight, Moon } from "lucide-react";

const DAYS_AR = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDate(d) {
  if (!d) return "---";
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function diffNights(a, b) {
  if (!a || !b) return 0;
  return Math.round((b - a) / 86400000);
}

export default function SearchDatePicker({ open, onClose, checkIn, checkOut, onConfirm }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [startDate, setStartDate] = useState(checkIn || null);
  const [endDate, setEndDate] = useState(checkOut || null);
  const [selecting, setSelecting] = useState("start");

  if (!open) return null;

  const nights = diffNights(startDate, endDate);

  const handleDayClick = (d) => {
    if (d < today) return;
    if (selecting === "start") {
      setStartDate(d);
      setEndDate(null);
      setSelecting("end");
    } else {
      if (d <= startDate) {
        setStartDate(d);
        setEndDate(null);
      } else {
        setEndDate(d);
        setSelecting("start");
      }
    }
  };

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const renderMonth = (year, month) => {
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

    const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
      <div key={`${year}-${month}`} style={{ marginBottom: "1.5rem" }}>
        <div style={{ textAlign: "center", fontWeight: 800, fontSize: "0.95rem", color: "#111827", marginBottom: "0.6rem" }}>{monthName}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
          {cells.map((date, i) => {
            if (!date) return <div key={`e${i}`} />;
            const isPast = date < today;
            const isStart = startDate && date.getTime() === startDate.getTime();
            const isEnd = endDate && date.getTime() === endDate.getTime();
            const inRange = startDate && endDate && date > startDate && date < endDate;
            const isToday = date.getTime() === today.getTime();

            let bg = "transparent";
            let color = isPast ? "#cbd5e1" : "#374151";
            let fontW = 600;
            if (isStart || isEnd) { bg = "#173f78"; color = "white"; fontW = 800; }
            else if (inRange) { bg = "rgba(23,63,120,0.08)"; color = "#173f78"; }
            if (isToday && !isStart && !isEnd) { fontW = 900; color = "#173f78"; }

            return (
              <button
                key={date.getTime()}
                type="button"
                onClick={() => !isPast && handleDayClick(date)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "100%", aspectRatio: "1", border: "none",
                  borderRadius: isStart || isEnd ? "50%" : inRange ? "4px" : "50%",
                  background: bg, color, fontWeight: fontW,
                  fontSize: "0.82rem", cursor: isPast ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render 3 months from viewDate
  const months = [];
  for (let i = 0; i < 3; i++) {
    const m = new Date(viewDate.getFullYear(), viewDate.getMonth() + i, 1);
    months.push(renderMonth(m.getFullYear(), m.getMonth()));
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", width: "100%", maxWidth: "480px",
          maxHeight: "92vh", background: "white",
          borderRadius: "1.5rem 1.5rem 0 0",
          display: "flex", flexDirection: "column",
          fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
          animation: "sdp-up 0.3s ease",
        }}
      >
        <style>{`@keyframes sdp-up { from { transform: translateY(100%); } to { transform: none; } }`}</style>

        {/* Header */}
        <div style={{ padding: "1.2rem 1.2rem 0.8rem", borderBottom: "1px solid #f0f0f0" }}>
          <h3 style={{ margin: 0, textAlign: "center", fontWeight: 900, fontSize: "1.1rem", color: "#111827" }}>اختر التواريخ</h3>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", marginTop: "1rem" }}>
            <div style={{ textAlign: "center", cursor: "pointer", opacity: selecting === "start" ? 1 : 0.5 }} onClick={() => setSelecting("start")}>
              <ArrowLeftRight size={20} style={{ color: "#173f78", marginBottom: "0.2rem" }} />
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b7280" }}>موعد الوصول</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#111827" }}>{formatDate(startDate)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Moon size={20} style={{ color: "#173f78", marginBottom: "0.2rem" }} />
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b7280" }}>إجمالي الليالي</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#111827" }}>{nights || "---"}</div>
            </div>
            <div style={{ textAlign: "center", cursor: "pointer", opacity: selecting === "end" ? 1 : 0.5 }} onClick={() => setSelecting("end")}>
              <ArrowLeftRight size={20} style={{ color: "#173f78", marginBottom: "0.2rem", transform: "scaleX(-1)" }} />
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6b7280" }}>موعد المغادرة</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#111827" }}>{formatDate(endDate)}</div>
            </div>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0.6rem 1rem 0.2rem", borderBottom: "1px solid #f0f0f0" }}>
          {DAYS_AR.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af" }}>{d}</div>
          ))}
        </div>

        {/* Calendar scroll */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.8rem 1rem" }}>
          {/* Month navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <button type="button" onClick={prevMonth} style={{ border: "none", background: "none", cursor: "pointer", padding: "0.3rem" }}>
              <ChevronRight size={18} style={{ color: "#374151" }} />
            </button>
            <button type="button" onClick={nextMonth} style={{ border: "none", background: "none", cursor: "pointer", padding: "0.3rem" }}>
              <ChevronLeft size={18} style={{ color: "#374151" }} />
            </button>
          </div>
          {months}
        </div>

        {/* Confirm */}
        <div style={{ padding: "0.8rem 1rem 1.2rem" }}>
          <button
            type="button"
            disabled={!startDate || !endDate}
            onClick={() => onConfirm(startDate, endDate)}
            style={{
              width: "100%", padding: "0.9rem", border: "none", borderRadius: "0.85rem",
              backgroundColor: startDate && endDate ? "#173f78" : "#cbd5e1",
              color: "white", fontWeight: 800, fontSize: "1rem",
              cursor: startDate && endDate ? "pointer" : "default",
              fontFamily: "inherit",
            }}
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
