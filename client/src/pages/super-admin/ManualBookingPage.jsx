import { useState } from "react";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Users,
  UserCheck,
  Heart,
  Share2,
  Star,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useGetHotelsQuery } from "../../store/services/api";

/* ─── Hero image (beach resort aerial) ───────────────────────────── */
const HERO_IMG =
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80&fit=crop";

/* ─── Booking type tab icons (SVG inline to avoid import issues) ─── */
function IconHotels({ color = "currentColor" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function IconActivities({ color = "currentColor" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 11.5A5 5 0 0 0 7 11.5" />
      <path d="M12 2v2" />
      <path d="M4.2 4.2 5.6 5.6" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M18.4 4.2 17 5.6" />
      <path d="M12 22v-4" />
      <path d="M9 19h6" />
    </svg>
  );
}
function IconPackages({ color = "currentColor" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

const BOOKING_TYPES = [
  { key: "hotels", labelKey: "mb_tabHotels", Icon: IconHotels },
  { key: "activities", labelKey: "mb_tabActivities", Icon: IconActivities },
  { key: "packages", labelKey: "mb_tabPackages", Icon: IconPackages },
];

/* ─── Hotel type filter tabs ──────────────────────────────────────── */
const HOTEL_TYPES = [
  { key: "all", label: "الكل" },
  { key: "hotel", label: "Hotel" },
  { key: "motel", label: "Motel" },
  { key: "resort", label: "Resort" },
];

function HotelTypeTabIcon({ typeKey, active }) {
  const color = active ? "#1e3a5f" : "#94a3b8";
  switch (typeKey) {
    case "resort":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 17c3-3 4-7 9-7s6 4 9 7" />
          <path d="M12 10V3" />
          <path d="M8 6c1-1 3-2 4-3" />
          <path d="M16 6c-1-1-3-2-4-3" />
        </svg>
      );
    case "motel":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "hotel":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      );
    default: // all
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
  }
}

/* ─── Mock hotel results ──────────────────────────────────────────── */
const MOCK_HOTELS = [
  {
    id: 1,
    name: "Maldives Beach Resort",
    type: "resort",
    typeLabel: "Resort",
    stars: 5,
    price: 320,
    currency: "$",
    location: "المالديف",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&fit=crop",
    ],
  },
  {
    id: 2,
    name: "Dubai Marina Hotel",
    type: "hotel",
    typeLabel: "Hotel",
    stars: 4,
    price: 210,
    currency: "$",
    location: "دبي، الإمارات",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fit=crop",
    ],
  },
  {
    id: 3,
    name: "Cairo Nile View",
    type: "hotel",
    typeLabel: "Hotel",
    stars: 4,
    price: 95,
    currency: "$",
    location: "القاهرة، مصر",
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80&fit=crop",
    ],
  },
  {
    id: 4,
    name: "Red Sea Motel",
    type: "motel",
    typeLabel: "Motel",
    stars: 3,
    price: 65,
    currency: "$",
    location: "الغردقة، مصر",
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&fit=crop",
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════ */
export default function ManualBookingPage() {
  const { t, lang } = useLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [bookingType, setBookingType] = useState("hotels");
  const [country, setCountry] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeType, setActiveType] = useState("all");

  // Fetch real hotels from DB
  const { data: hotelsData = [], isLoading: hotelsLoading } = useGetHotelsQuery(undefined, { skip: !searched });

  // Map DB hotels to card shape; filter by country + type
  const dbHotels = hotelsData.map((h) => ({
    id: h._id,
    name: h.name,
    type: h.category?.toLowerCase() || "hotel",
    typeLabel: h.category || "Hotel",
    stars: h.stars || 3,
    price: null,
    currency: "$",
    location: [h.city, h.country].filter(Boolean).join(", "),
    images: [h.thumbnail].filter(Boolean),
  }));
  const filteredHotels = dbHotels
    .filter((h) => !country || h.location.toLowerCase().includes(
      country === "EG" ? "egypt" : country === "AE" ? "uae" : country === "SA" ? "saudi" : country.toLowerCase()
    ))
    .filter((h) => activeType === "all" || h.type === activeType);

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="page-shell" dir={dir}>
      {/* Page header */}
      <div className="mb-4">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {t("mb_pageTitle")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("mb_pageSubtitle")}
        </p>
      </div>

      {!searched ? (
        /* ══ SEARCH FORM VIEW ═══════════════════════════════════════ */
        <>
          {/* Hero with real image */}
          <div
            className="relative rounded-3xl overflow-hidden mb-5"
            style={{ minHeight: 270 }}
          >
            <img
              src={HERO_IMG}
              alt="resort hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.55) 100%)",
              }}
            />

            {/* Branding — top right */}
            <div className="absolute top-0 inset-x-0 p-5 flex justify-end">
              <div className="text-end">
                <h2 className="text-3xl font-black text-white tracking-[0.1em] drop-shadow-lg">
                  TRAVKY
                </h2>
                <p className="text-sm text-white/80 font-medium mt-0.5">
                  {t("mb_heroSlogan")}
                </p>
              </div>
            </div>

            {/* Booking type tabs — bottom left */}
            <div className="absolute bottom-0 inset-x-0 pb-5 px-5 flex gap-3">
              {BOOKING_TYPES.map((bt) => {
                const active = bookingType === bt.key;
                return (
                  <button
                    key={bt.key}
                    onClick={() => setBookingType(bt.key)}
                    className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl text-xs font-bold min-w-[72px] transition-all active:scale-95"
                    style={{
                      backgroundColor: active
                        ? "rgba(255,255,255,0.97)"
                        : "rgba(255,255,255,0.18)",
                      color: active ? "#1e3a5f" : "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(8px)",
                      border: active
                        ? "1.5px solid rgba(255,255,255,0.8)"
                        : "1px solid rgba(255,255,255,0.3)",
                      boxShadow: active ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
                    }}
                  >
                    <bt.Icon
                      color={active ? "#1e3a5f" : "rgba(255,255,255,0.9)"}
                    />
                    {t(bt.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search form */}
          <div
            className="rounded-2xl p-5 mb-5 space-y-4"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Country */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {t("mb_country")}
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: country
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  <option value="">{t("mb_allCountries")}</option>
                  <option value="EG">{t("mb_countryEgypt")}</option>
                  <option value="AE">{t("mb_countryUAE")}</option>
                  <option value="SA">{t("mb_countrySaudi")}</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    [dir === "rtl" ? "left" : "right"]: 12,
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("mb_checkIn"), val: checkIn, set: setCheckIn },
                { label: t("mb_checkOut"), val: checkOut, set: setCheckOut },
              ].map(({ label, val, set }, idx) => (
                <div key={idx}>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <ArrowIcon size={12} className="inline me-1" />
                    {label}
                  </label>
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Rooms & Guests */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {t("mb_roomsGuests")}
              </label>
              <div className="relative">
                <button
                  onClick={() => setGuestsOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span>
                    {rooms} {t("mb_room")} · {adults} {t("mb_adults")} ·{" "}
                    {children} {t("mb_children")}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>
                {guestsOpen && (
                  <div
                    className="absolute z-20 top-full mt-1 w-full rounded-2xl p-4 shadow-xl space-y-3"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <GuestCounter
                      label={t("mb_rooms")}
                      icon={<UserCheck size={16} />}
                      value={rooms}
                      min={1}
                      max={10}
                      onChange={setRooms}
                    />
                    <GuestCounter
                      label={t("mb_adults")}
                      icon={<Users size={16} />}
                      value={adults}
                      min={1}
                      max={20}
                      onChange={setAdults}
                    />
                    <GuestCounter
                      label={t("mb_children")}
                      icon={<Users size={14} />}
                      value={children}
                      min={0}
                      max={10}
                      onChange={setChildren}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={() => {
                setGuestsOpen(false);
                setSearched(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
            >
              <Search size={16} />
              {t("mb_searchBtn")}
            </button>
          </div>
        </>
      ) : (
        /* ══ RESULTS VIEW ═══════════════════════════════════════════ */
        <>
          {/* Dark navy top bar */}
          <div
            className="rounded-2xl mb-4 overflow-hidden"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {/* Brand row */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <button
                onClick={() => setSearched(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              >
                <ArrowIcon size={16} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-lg tracking-wider">
                  Travky
                </span>
                <ChevronRight size={15} className="text-white/60" />
              </div>
            </div>

            {/* Search pill */}
            <div className="px-4 pb-4">
              <div
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ backgroundColor: "#fff" }}
              >
                <div
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: "#1e3a5f" }}
                >
                  <span className="font-bold">
                    {country === "EG"
                      ? "مصر"
                      : country === "AE"
                        ? "الإمارات"
                        : country === "SA"
                          ? "السعودية"
                          : t("mb_allCountries")}
                  </span>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    ({rooms} 🏨 {adults} 👤)
                  </span>
                </div>
                <Search size={18} style={{ color: "#1e3a5f" }} />
              </div>
            </div>
          </div>

          {/* Big feature image */}
          <div
            className="rounded-3xl overflow-hidden mb-4"
            style={{ height: 210 }}
          >
            <img
              src={HERO_IMG}
              alt="featured"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Hotel type filter tabs */}
          <div
            className="flex justify-end gap-5 px-1 mb-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            {HOTEL_TYPES.map((ht) => {
              const active = activeType === ht.key;
              return (
                <button
                  key={ht.key}
                  onClick={() => setActiveType(ht.key)}
                  className="flex flex-col items-center gap-1 pb-3 text-xs font-semibold relative transition-colors"
                  style={{ color: active ? "#1e3a5f" : "var(--text-muted)" }}
                >
                  <HotelTypeTabIcon typeKey={ht.key} active={active} />
                  {ht.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full"
                      style={{ backgroundColor: "#1e3a5f" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hotel cards */}
          <div className="space-y-4">
            {hotelsLoading ? (
              <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
                {t("loading") || "Loading..."}
              </p>
            ) : filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} t={t} />
              ))
            ) : (
              <p
                className="text-center py-10 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {t("noData")}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Hotel card ──────────────────────────────────────────────────── */
function HotelCard({ hotel, t }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Image */}
      <div className="relative" style={{ height: 210 }}>
        <img
          src={hotel.images[imgIdx]}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fit=crop";
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)",
          }}
        />

        {/* Heart + Share — top left */}
        <div className="absolute top-3 left-3 flex gap-2">
          <button
            onClick={() => setLiked((l) => !l)}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
            style={{ backgroundColor: "#fff" }}
          >
            <Heart
              size={16}
              fill={liked ? "#ef4444" : "none"}
              stroke={liked ? "#ef4444" : "#64748b"}
            />
          </button>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "#fff" }}
          >
            <Share2 size={16} stroke="#64748b" />
          </button>
        </div>

        {/* Type badge — top right */}
        <div className="absolute top-3 right-3">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
          >
            {hotel.typeLabel}
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="white"
              stroke="none"
            >
              <rect x="2" y="2" width="20" height="20" rx="4" />
            </svg>
          </span>
        </div>

        {/* Dot slider */}
        {hotel.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {hotel.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === imgIdx ? 18 : 6,
                  height: 6,
                  backgroundColor:
                    i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="p-4" dir="rtl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-sm truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {hotel.name}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {hotel.location}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} size={11} fill="#f59e0b" stroke="none" />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            className="px-5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
          >
            {t("mb_bookNow")}
          </button>
          <div className="text-end">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t("mb_startingFrom")}
            </p>
            <p className="text-base font-black" style={{ color: "#1e3a5f" }}>
              {hotel.currency}
              {hotel.price}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Guest counter ───────────────────────────────────────────────── */
function GuestCounter({ label, icon, value, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          style={{
            backgroundColor: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          −
        </button>
        <span
          className="w-6 text-center text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          style={{
            backgroundColor: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
