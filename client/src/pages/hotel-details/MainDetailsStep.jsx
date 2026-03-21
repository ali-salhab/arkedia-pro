import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, Star, ChevronDown, Camera } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* Fix Leaflet default icon paths broken by bundlers */
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

/* ── Custom pin icon ──────────────────────────────────── */
const makePinIcon = () =>
  L.divIcon({
    className: "",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    html: `<svg viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="36" rx="5" ry="2" fill="rgba(0,0,0,0.18)"/>
      <path d="M14 1C8.5 1 4 5.5 4 11c0 7.5 10 24 10 24s10-16.5 10-24C24 5.5 19.5 1 14 1z"
        fill="#2563eb" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="11" r="4" fill="white"/>
    </svg>`,
  });

/* ── Interactive Location Picker ─────────────────────── */
function LocationPickerMap({ city, country, lat, lng, onPick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  /* Mount the map once */
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const initLat = lat ?? 26;
    const initLng = lng ?? 30;
    const zoom = lat != null ? 14 : 6;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([initLat, initLng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (lat != null && lng != null) {
      const m = L.marker([lat, lng], {
        icon: makePinIcon(),
        draggable: true,
      }).addTo(map);
      m.on("dragend", () => {
        const p = m.getLatLng();
        onPick(p.lat, p.lng);
      });
      markerRef.current = m;
    }

    map.on("click", (e) => {
      const { lat: la, lng: ln } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([la, ln]);
      } else {
        const m = L.marker([la, ln], {
          icon: makePinIcon(),
          draggable: true,
        }).addTo(map);
        m.on("dragend", () => {
          const p = m.getLatLng();
          onPick(p.lat, p.lng);
        });
        markerRef.current = m;
      }
      onPick(la, ln);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // mount once

  /* Geocode city/country when no manual pin yet */
  useEffect(() => {
    if (!mapRef.current) return;
    if (lat != null) return;
    const q = [city, country].filter(Boolean).join(", ");
    if (!q) return;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((r) => r.json())
      .then((data) => {
        if (data[0] && mapRef.current) {
          mapRef.current.flyTo(
            [parseFloat(data[0].lat), parseFloat(data[0].lon)],
            12,
          );
        }
      })
      .catch(() => {});
  }, [city, country]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}

const HOTEL_CATEGORIES = [
  "Hotel",
  "Resort",
  "Boutique",
  "Hostel",
  "Motel",
  "Villa",
];
const COUNTRIES = [
  "Egypt",
  "Saudi Arabia",
  "UAE",
  "Jordan",
  "Morocco",
  "Tunisia",
];
const CITIES = {
  Egypt: [
    "Cairo",
    "Alexandria",
    "Giza",
    "Luxor",
    "Aswan",
    "Sharm El Sheikh",
    "Hurghada",
  ],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
  Jordan: ["Amman", "Aqaba", "Petra", "Irbid"],
  Morocco: ["Casablanca", "Marrakech", "Fez", "Rabat"],
  Tunisia: ["Tunis", "Sfax", "Sousse", "Hammamet"],
};

export default function HotelMainDetailsStep() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    const saved = JSON.parse(
      sessionStorage.getItem("hotel_details_main") || "null",
    );
    return {
      logoDataUrl: saved?.logoDataUrl || null,
      nameEn: saved?.nameEn || "",
      nameAr: saved?.nameAr || "",
      category: saved?.category || "Hotel",
      stars: saved?.stars || 0,
      country: saved?.country || "Egypt",
      city: saved?.city || "",
      location: saved?.location || "",
      postCode: saved?.postCode || "",
      lat: saved?.lat ?? null,
      lng: saved?.lng ?? null,
    };
  });

  const [nameLang, setNameLang] = useState("en");
  const [errors, setErrors] = useState({});

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const clearError = (field) =>
    setErrors((e) => {
      const n = { ...e };
      delete n[field];
      return n;
    });

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("logoDataUrl", ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.nameEn.trim()) errs.nameEn = "Hotel name (English) is required";
    if (!form.stars) errs.stars = "Please select star rating";
    if (!form.city.trim()) errs.city = "City is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    sessionStorage.setItem(
      "hotel_details_main",
      JSON.stringify({
        logoDataUrl: form.logoDataUrl,
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        category: form.category,
        stars: form.stars,
        country: form.country,
        city: form.city,
        location: form.location,
        postCode: form.postCode,
        lat: form.lat,
        lng: form.lng,
      }),
    );
    navigate("/hotel/details/description");
  };

  const LangToggle = ({ lang, setLang }) => (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setLang("en")}
        className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
        style={{
          backgroundColor:
            lang === "en" ? "var(--sidebar-active-text)" : "var(--bg-raised)",
          color: lang === "en" ? "#fff" : "var(--text-secondary)",
          border: `1px solid ${lang === "en" ? "var(--sidebar-active-text)" : "var(--border)"}`,
        }}
      >
        <img
          src="https://flagcdn.com/w20/us.png"
          alt="EN"
          className="h-4 w-5 rounded object-cover"
        />
        EN
      </button>
      <button
        onClick={() => setLang("ar")}
        className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
        style={{
          backgroundColor:
            lang === "ar" ? "var(--sidebar-active-text)" : "var(--bg-raised)",
          color: lang === "ar" ? "#fff" : "var(--text-secondary)",
          border: `1px solid ${lang === "ar" ? "var(--sidebar-active-text)" : "var(--border)"}`,
        }}
      >
        <img
          src="https://flagcdn.com/w20/eg.png"
          alt="AR"
          className="h-4 w-5 rounded object-cover"
        />
        AR
      </button>
    </div>
  );

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      {/* Logo upload */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <button
          onClick={() => logoInputRef.current?.click()}
          className="relative flex h-24 w-24 items-center justify-center rounded-full transition-all group overflow-hidden"
          style={{
            border: "2.5px dashed var(--brand)",
            backgroundColor: "var(--bg-raised)",
            color: "var(--brand)",
          }}
        >
          {form.logoDataUrl ? (
            <>
              <img
                src={form.logoDataUrl}
                alt="logo"
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              >
                <Camera size={22} className="text-white" />
              </div>
            </>
          ) : (
            <Upload size={26} />
          )}
        </button>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Upload Logo
        </span>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* Hotel Name - full width */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              Hotel Name
            </label>
            <LangToggle lang={nameLang} setLang={setNameLang} />
          </div>
          <input
            className="input"
            placeholder={
              nameLang === "en"
                ? "Hotel name in English"
                : "اسم الفندق بالعربية"
            }
            dir={nameLang === "ar" ? "rtl" : "ltr"}
            value={nameLang === "en" ? form.nameEn : form.nameAr}
            onChange={(e) => {
              set(nameLang === "en" ? "nameEn" : "nameAr", e.target.value);
              clearError("nameEn");
            }}
          />
          {errors.nameEn && <p className="input-error mt-1">{errors.nameEn}</p>}
        </div>

        {/* Category */}
        <div>
          <label
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Hotel Category
          </label>
          <div className="relative">
            <select
              className="input appearance-none pr-10"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {HOTEL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>

        {/* Stars */}
        <div>
          <label
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Hotel Stars
          </label>
          <div className="flex items-center gap-1 h-[42px]">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => {
                  set("stars", n);
                  clearError("stars");
                }}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  fill={n <= form.stars ? "#f59e0b" : "none"}
                  stroke={n <= form.stars ? "#f59e0b" : "var(--border)"}
                />
              </button>
            ))}
            {form.stars > 0 && (
              <button
                onClick={() => set("stars", 0)}
                className="ml-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            )}
          </div>
          {errors.stars && <p className="input-error mt-1">{errors.stars}</p>}
        </div>

        {/* Country */}
        <div>
          <label
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Hotel Country
          </label>
          <div className="relative">
            <select
              className="input appearance-none pr-10"
              value={form.country}
              onChange={(e) => {
                set("country", e.target.value);
                set("city", "");
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Hotel City
          </label>
          <div className="relative">
            <select
              className="input appearance-none pr-10"
              value={form.city}
              onChange={(e) => {
                set("city", e.target.value);
                clearError("city");
              }}
            >
              <option value="">Select city</option>
              {(CITIES[form.country] || []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
          {errors.city && <p className="input-error mt-1">{errors.city}</p>}
        </div>

        {/* Location */}
        <div>
          <label
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Location / Street
          </label>
          <div className="relative">
            <MapPin
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              className="input pl-9"
              placeholder="Street / Area name"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
        </div>

        {/* PostCode */}
        <div>
          <label
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Post Code
          </label>
          <input
            className="input"
            placeholder="e.g. 11511"
            value={form.postCode}
            onChange={(e) => set("postCode", e.target.value)}
          />
        </div>

        {/* Map - full width */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              Pin Location on Map
            </label>
            {form.lat != null && (
              <div className="flex items-center gap-3">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </span>
                <button
                  type="button"
                  onClick={() => set("lat", null) || set("lng", null)}
                  className="text-xs px-2 py-0.5 rounded-lg"
                  style={{
                    color: "var(--danger)",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-raised)",
                  }}
                >
                  Clear Pin
                </button>
              </div>
            )}
          </div>
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{ height: 260, border: "1px solid var(--border)" }}
          >
            <LocationPickerMap
              city={form.city}
              country={form.country}
              lat={form.lat}
              lng={form.lng}
              onPick={(la, ln) => {
                set("lat", la);
                set("lng", ln);
              }}
            />
          </div>
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Click anywhere on the map to drop a pin · Drag the pin to adjust
          </p>
        </div>
      </div>

      {/* Next */}
      <div className="mt-8">
        <button
          onClick={handleNext}
          className="btn btn-primary w-full py-3 text-base rounded-2xl"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          Next → Description
        </button>
      </div>
    </div>
  );
}
