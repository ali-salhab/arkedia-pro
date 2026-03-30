import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Star, ChevronRight, SlidersHorizontal,
  Heart, Share2, Map, ArrowUpDown, CalendarDays, Users, BedDouble, CheckCircle2,
} from "lucide-react";
import { useLazySearchHotelsPublicQuery, useLazyGetPublicHotelsByLocationQuery } from "../../store/services/api";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";
import PublicAuthModal from "../../components/PublicAuthModal";
import { usePublicClientSession } from "../../hooks/usePublicClientSession";

const starsRow = (n) =>
  n ? Array.from({ length: n }, (_, i) => <Star key={i} size={12} fill="#f59e0b" stroke="#f59e0b" />) : null;

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dt.getMonth()]} ${dt.getDate()}`;
};

/* ════════════════════════════════════════════════════════════════════ */

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [clientSession, setClientSession] = usePublicClientSession();
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [stickySearch, setStickySearch] = useState(false);

  const q        = params.get("q") || "";
  const type     = params.get("type") || "query";
  const hotelId  = params.get("hotelId") || "";
  const city     = params.get("city") || "";
  const country  = params.get("country") || "";
  const checkIn  = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";
  const rooms    = params.get("rooms") || "1";
  const adults   = params.get("adults") || "2";
  const children = params.get("children") || "0";

  /* Allow scrolling — overrides the dashboard's html/body/#root overflow:hidden */
  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById("root")];
    els.forEach((el) => { if (el) el.style.overflow = "auto"; });
    return () => { els.forEach((el) => { if (el) el.style.overflow = ""; }); };
  }, []);

  const [triggerSearch, { data: searchResults = [], isFetching: sf }] = useLazySearchHotelsPublicQuery();
  const [triggerLoc,    { data: locResults = [],    isFetching: lf }] = useLazyGetPublicHotelsByLocationQuery();

  useEffect(() => {
    if (type === "city" && city)         triggerLoc({ city, country });
    else if (type === "country" && country) triggerLoc({ country });
    else if (q)                             triggerSearch(q);
  }, [q, type, city, country]);

  useEffect(() => {
    const fn = () => setStickySearch(window.scrollY > 120);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isFetching = sf || lf;
  const hotels = type === "city" || type === "country" ? locResults : searchResults;

  const sortedHotels = useMemo(() => {
    if (type === "hotel" && hotelId) {
      const c = [...hotels];
      const i = c.findIndex((h) => h._id === hotelId);
      if (i > 0) { const [it] = c.splice(i, 1); c.unshift(it); }
      return c;
    }
    return hotels;
  }, [hotels, type, hotelId]);

  const citiesMap = useMemo(() => {
    if (type !== "country") return null;
    const m = {};
    hotels.forEach((h) => { const c = h.city || "أخرى"; (m[c] ||= []).push(h); });
    return m;
  }, [hotels, type]);

  const handleClick = (h) => {
    const p = new URLSearchParams({ checkIn, checkOut, rooms, adults, children });
    navigate(`/hotel/${h._id}?${p}`);
  };

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1;

  const heroTitle = type === "city" ? city : type === "country" ? country : q;
  const destThumb = type === "hotel" && sortedHotels[0]?.thumbnail ? sortedHotels[0].thumbnail : null;

  /* ── render ── */
  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo','Tajawal',Arial,sans-serif", background: "#f3f6fb", minHeight: "100vh" }}>
      <PublicNavbar
        clientSession={clientSession}
        onLogout={() => { localStorage.removeItem("public_client_session"); setClientSession(null); }}
        onOpenAuthModal={(m) => { setAuthModalMode(m || "login"); setAuthModalOpen(true); }}
        scrolled={stickySearch}
      />

      {/* ─── Sticky compact bar ─── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        transform: stickySearch ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
        background: "white", borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0.55rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button onClick={() => navigate(-1)} style={backBtnStyle}><ChevronRight size={20} /></button>
          <Pill icon={destThumb
            ? <img src={destThumb} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            : <MapPin size={16} style={{ color: "#173f78" }} />}
            sub="الوجهة" main={heroTitle} flex />
          {checkIn && <DatePill checkIn={checkIn} checkOut={checkOut} nights={nights} />}
          <Pill icon={<Users size={14} style={{ color: "#173f78" }} />} main={`${rooms} غرفة, ${adults} بالغ`} />
        </div>
      </div>

      {/* ─── Top search bar ─── */}
      <div style={{ paddingTop: 70, background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem 1rem 0.8rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <button onClick={() => navigate(-1)} style={backBtnStyle}><ChevronRight size={22} /></button>
          <Pill icon={destThumb
            ? <img src={destThumb} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            : <MapPin size={18} style={{ color: "#173f78" }} />}
            sub="الوجهة" main={heroTitle} flex />
          {checkIn && (
            <div style={{ ...pillStyle, gap: "0.35rem" }}>
              <CalendarDays size={15} style={{ color: "#173f78" }} />
              <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>من</span>
              <span style={pillMainStyle}>{fmtDate(checkIn)}</span>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>إلى</span>
              <span style={pillMainStyle}>{fmtDate(checkOut)}</span>
              <span style={nightBadge}>{nights}N</span>
            </div>
          )}
          <div style={{ ...pillStyle, gap: "0.35rem" }}>
            <Users size={15} style={{ color: "#173f78" }} />
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>الغرف والضيوف</span>
            <span style={pillMainStyle}>{rooms} غرفة, {adults} بالغ</span>
          </div>
        </div>
      </div>

      {/* ─── Filter bar ─── */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b" }}>
            {!isFetching && `${(type === "country" ? hotels : sortedHotels).length} نتيجة`}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[{ l: "ترتيب", i: <ArrowUpDown size={14} /> }, { l: "فلتر", i: <SlidersHorizontal size={14} /> }, { l: "خريطة", i: <Map size={14} /> }].map(({ l, i }) => (
              <button key={l} style={filterBtnStyle}>{i} {l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.2rem 1rem 3rem" }}>
        {isFetching && <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "1rem", fontWeight: 600 }}>جارٍ البحث...</div>}

        {!isFetching && type === "country" && citiesMap && Object.entries(citiesMap).map(([cn, ch]) => (
          <div key={cn} style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.6rem 1rem", background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb" }}>
              <MapPin size={16} style={{ color: "#173f78" }} />
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "#111827" }}>{cn}</span>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>({ch.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {ch.map((h) => <HotelCard key={h._id} hotel={h} onClick={() => handleClick(h)} />)}
            </div>
          </div>
        ))}

        {!isFetching && type !== "country" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {sortedHotels.map((h) => <HotelCard key={h._id} hotel={h} onClick={() => handleClick(h)} />)}
          </div>
        )}

        {!isFetching && hotels.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#94a3b8" }}>
            <Search size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#64748b" }}>لا توجد نتائج</p>
            <p style={{ fontSize: "0.85rem", margin: "0.3rem 0 0" }}>حاول البحث بكلمات أخرى</p>
          </div>
        )}
      </div>

      <PublicFooter />
      <PublicAuthModal
        open={authModalOpen}
        mode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onModeChange={(m) => setAuthModalMode(m)}
        onAuthenticated={(s) => { setClientSession(s); setAuthModalOpen(false); }}
      />
      <style>{`
        .sr-card{transition:transform .2s,box-shadow .2s;cursor:pointer}
        .sr-card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.1)!important}
        .sr-float-btn:hover{background:rgba(255,255,255,1)!important}
      `}</style>
    </div>
  );
}

/* ═══════════════════ Sub-components ═══════════════════ */

function Pill({ icon, sub, main, flex }) {
  return (
    <div style={{ ...pillStyle, flex: flex ? "1 1 200px" : undefined, minWidth: flex ? 0 : undefined }}>
      {icon}
      <div style={{ minWidth: 0 }}>
        {sub && <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>{sub}</div>}
        <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{main}</div>
      </div>
    </div>
  );
}

function DatePill({ checkIn, checkOut, nights }) {
  return (
    <div style={{ ...pillStyle, gap: "0.3rem" }}>
      <CalendarDays size={14} style={{ color: "#173f78" }} />
      <span style={pillMainStyle}>{fmtDate(checkIn)}</span>
      <span style={{ color: "#94a3b8", fontSize: "0.65rem" }}>→</span>
      <span style={pillMainStyle}>{fmtDate(checkOut)}</span>
      <span style={nightBadge}>{nights}N</span>
    </div>
  );
}

function HotelCard({ hotel: h, onClick }) {
  const icons = h.selectedIcons || [];

  return (
    <div className="sr-card" onClick={onClick} style={{
      background: "white", borderRadius: "1.2rem", overflow: "hidden",
      border: "1px solid #e5e7eb", boxShadow: "0 1px 6px rgba(0,0,0,.04)",
    }}>
      {/* Image */}
      <div style={{ position: "relative", height: 260, overflow: "hidden", background: "#e2e8f0" }}>
        {h.thumbnail ? (
          <img src={h.thumbnail} alt={h.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#173f78,#1e5aad)" }}>
            <span style={{ fontSize: "3rem", color: "white", fontWeight: 900, opacity: 0.4 }}>{(h.name || "?")[0]}</span>
          </div>
        )}

        <div style={{ position: "absolute", top: "0.8rem", left: "0.8rem", display: "flex", gap: "0.4rem" }}>
          {[Heart, Share2].map((Icon, i) => (
            <button key={i} className="sr-float-btn" onClick={(e) => e.stopPropagation()} style={floatBtnStyle}>
              <Icon size={i === 0 ? 18 : 16} />
            </button>
          ))}
        </div>

        <div style={{
          position: "absolute", top: "0.8rem", right: "0.8rem",
          background: "rgba(23,63,120,.85)", backdropFilter: "blur(6px)",
          borderRadius: "0.6rem", padding: "0.3rem 0.7rem",
          display: "flex", alignItems: "center", gap: "0.3rem",
          color: "white", fontSize: "0.75rem", fontWeight: 700,
        }}>
          <BedDouble size={14} /> Hotel
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "1rem 1.2rem 0" }}>
        {h.stars > 0 && <div style={{ display: "flex", gap: 2, marginBottom: "0.3rem" }}>{starsRow(h.stars)}</div>}
        <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#111827", margin: "0 0 0.35rem", lineHeight: 1.3 }}>{h.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#64748b", fontSize: "0.82rem", marginBottom: "0.6rem" }}>
          <MapPin size={14} />
          <span>{[h.city, h.country].filter(Boolean).join(", ")}</span>
        </div>

        {icons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem", marginBottom: "0.6rem" }}>
            {icons.slice(0, 4).map((ic) => (
              <span key={ic._id} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "#475569" }}>
                {ic.imageUrl
                  ? <img src={ic.imageUrl} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />
                  : <span>•</span>}
                {ic.labelAr || ic.label}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.8rem" }}>
          <Badge color="#059669" text="إلغاء مجاني" />
          <Badge color="#475569" text="ادفع في الفندق" muted />
          <Badge color="#475569" text="Book @ Travky.com" muted />
        </div>
      </div>

      {/* Price bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.8rem 1.2rem", borderTop: "1px solid #f1f5f9", background: "#fafbfc",
      }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#173f78", fontWeight: 800 }}>السعر لليلة الواحدة</div>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>شامل الضرائب والرسوم</div>
        </div>
        {h.startingPrice != null ? (
          <div style={{ border: "2px solid #173f78", borderRadius: "1rem", padding: "0.4rem 1rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>يبدأ من</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#173f78" }}>
              {h.currency !== "USD" ? h.currency : "$"}{h.startingPrice}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>اتصل للسعر</div>
        )}
      </div>
    </div>
  );
}

function Badge({ color, text, muted }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.76rem", fontWeight: muted ? 600 : 700, color }}>
      <CheckCircle2 size={14} style={muted ? { color: "#94a3b8" } : undefined} /> {text}
    </span>
  );
}

/* ═══════════════════ Shared styles ═══════════════════ */

const backBtnStyle = { border: "none", background: "none", cursor: "pointer", padding: "0.3rem", display: "flex", color: "#111827" };
const pillStyle = { display: "flex", alignItems: "center", gap: "0.5rem", background: "#f8fafc", borderRadius: "2rem", padding: "0.4rem 0.9rem 0.4rem 0.5rem", border: "1px solid #e5e7eb", flexShrink: 0 };
const pillMainStyle = { fontSize: "0.82rem", fontWeight: 800, color: "#111827" };
const nightBadge = { background: "#173f78", color: "white", borderRadius: "0.4rem", padding: "0.1rem 0.35rem", fontSize: "0.65rem", fontWeight: 800, marginInlineStart: "0.2rem" };
const floatBtnStyle = { width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.9)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", transition: "background .2s" };
const filterBtnStyle = { display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 0.9rem", borderRadius: "1.5rem", border: "1.5px solid #d1d5db", background: "white", fontSize: "0.8rem", fontWeight: 700, color: "#374151", cursor: "pointer", fontFamily: "inherit" };
