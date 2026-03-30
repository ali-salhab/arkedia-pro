import { useState, useEffect, useRef, useMemo } from "react";
import { MapPin, Navigation, Star, X, Globe, Building2 } from "lucide-react";
import { useLazySearchHotelsPublicQuery } from "../store/services/api";

export default function SearchDestinationPanel({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [triggerSearch, { data: results = [], isFetching }] = useLazySearchHotelsPublicQuery();

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 1) triggerSearch(query.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [query, triggerSearch]);

  /* Extract unique cities and countries from results */
  const { cities, countries } = useMemo(() => {
    const citySet = new Map();
    const countrySet = new Map();
    const q = query.trim().toLowerCase();
    results.forEach((h) => {
      if (h.city && h.city.toLowerCase().includes(q) && !citySet.has(h.city)) {
        citySet.set(h.city, h.country);
      }
      if (h.country && h.country.toLowerCase().includes(q) && !countrySet.has(h.country)) {
        countrySet.set(h.country, true);
      }
    });
    return {
      cities: Array.from(citySet.entries()).map(([city, country]) => ({ city, country })),
      countries: Array.from(countrySet.keys()),
    };
  }, [results, query]);

  if (!open) return null;

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSelect({
          type: "gps",
          label: "موقعي الحالي",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {}
    );
  };

  const stars = (n) => n ? Array.from({ length: n }, (_, i) => (
    <Star key={i} size={11} fill="#f59e0b" stroke="#f59e0b" />
  )) : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", width: "100%", maxWidth: "480px",
          maxHeight: "85vh", background: "white",
          borderRadius: "1.5rem 1.5rem 0 0",
          display: "flex", flexDirection: "column",
          fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
          animation: "sdest-up 0.3s ease",
        }}
      >
        <style>{`@keyframes sdest-up { from { transform: translateY(100%); } to { transform: none; } }`}</style>

        {/* Search input */}
        <div style={{ padding: "1rem 1rem 0.6rem", display: "flex", alignItems: "center", gap: "0.6rem", borderBottom: "1px solid #f0f0f0" }}>
          <MapPin size={20} style={{ color: "#173f78", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, marginBottom: "0.1rem" }}>الوجهة</div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب اسم الدولة، المدينة أو الفندق"
              style={{ border: "none", background: "none", width: "100%", fontSize: "0.9rem", color: "#111827", outline: "none", fontFamily: "inherit", padding: 0 }}
            />
          </div>
          {query && (
            <button type="button" onClick={() => setQuery("")} style={{ border: "none", background: "none", cursor: "pointer", padding: "0.2rem" }}>
              <X size={16} style={{ color: "#9ca3af" }} />
            </button>
          )}
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 0" }}>
          {/* GPS option */}
          <button
            type="button"
            onClick={handleGPS}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "0.8rem",
              padding: "0.85rem 1.2rem", border: "none", background: "rgba(23,63,120,0.03)",
              cursor: "pointer", fontFamily: "inherit", textAlign: "right",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(23,63,120,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Navigation size={18} style={{ color: "#173f78" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#111827" }}>البحث بموقعي الحالي</div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>استخدم GPS لتحديد موقعك</div>
            </div>
          </button>

          {/* Hotel results */}
          {isFetching && (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>جارٍ البحث...</div>
          )}

          {/* Country suggestions */}
          {!isFetching && countries.map((c) => (
            <button
              key={`country-${c}`}
              type="button"
              onClick={() => onSelect({ type: "country", label: c, country: c })}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.8rem",
                padding: "0.75rem 1.2rem", border: "none", background: "rgba(23,63,120,0.02)",
                cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(23,63,120,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Globe size={18} style={{ color: "#173f78" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#111827" }}>{c}</div>
                <div style={{ fontSize: "0.73rem", color: "#9ca3af" }}>جميع فنادق الدولة</div>
              </div>
            </button>
          ))}

          {/* City suggestions */}
          {!isFetching && cities.map(({ city, country }) => (
            <button
              key={`city-${city}`}
              type="button"
              onClick={() => onSelect({ type: "city", label: city, city, country })}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.8rem",
                padding: "0.75rem 1.2rem", border: "none", background: "rgba(23,63,120,0.02)",
                cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,176,32,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={18} style={{ color: "#d97706" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#111827" }}>{city}</div>
                <div style={{ fontSize: "0.73rem", color: "#9ca3af" }}>{country} • فنادق المدينة</div>
              </div>
            </button>
          ))}

          {/* Hotel results */}
          {!isFetching && results.map((h) => (
            <button
              key={h._id}
              type="button"
              onClick={() => onSelect({ type: "hotel", id: h._id, label: h.name, city: h.city, country: h.country, stars: h.stars, thumbnail: h.thumbnail })}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.8rem",
                padding: "0.75rem 1.2rem", border: "none", background: "white",
                cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {h.thumbnail ? (
                <img src={h.thumbnail} alt="" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={18} style={{ color: "#9ca3af" }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#6b7280" }}>
                  {h.city && <span>{h.city}, {h.country || ""}</span>}
                  {h.stars > 0 && <span style={{ display: "inline-flex", gap: "1px", marginInlineStart: "0.3rem" }}>{stars(h.stars)}</span>}
                </div>
              </div>
            </button>
          ))}

          {!isFetching && query.trim().length >= 1 && results.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#9ca3af", fontSize: "0.85rem" }}>
              لا توجد نتائج مطابقة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
