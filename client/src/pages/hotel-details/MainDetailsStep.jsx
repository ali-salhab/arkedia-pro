import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, Star, ChevronDown, Camera } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";
import { useGetHotelsQuery } from "../../store/services/api";
import {
  buildHotelDraftFromRecord,
  persistHotelDraftToSession,
  setStoredHotelId,
} from "./draftUtils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const COPY = {
  en: {
    uploadLogo: "Upload Logo",
    hotelName: "Hotel Name",
    nameEnPlaceholder: "Hotel name in English",
    nameArPlaceholder: "Hotel name in Arabic",
    category: "Hotel Category",
    stars: "Hotel Stars",
    country: "Hotel Country",
    city: "Hotel City",
    selectCity: "Select city",
    location: "Location / Street",
    locationPlaceholder: "Street / Area name",
    postCode: "Post Code",
    postCodePlaceholder: "e.g. 11511",
    mapTitle: "Pin Location on Map",
    clearPin: "Clear Pin",
    mapHint: "Click anywhere on the map to drop a pin. Drag the pin to adjust.",
    next: "Next -> Description",
    errors: {
      name: "Hotel name in English is required",
      stars: "Please select a star rating",
      city: "City is required",
    },
    categories: ["Hotel", "Resort", "Boutique", "Hostel", "Motel", "Villa"],
    countries: {
      Egypt: "Egypt",
      "Saudi Arabia": "Saudi Arabia",
      UAE: "UAE",
      Jordan: "Jordan",
      Morocco: "Morocco",
      Tunisia: "Tunisia",
    },
  },
  ar: {
    uploadLogo: "رفع الشعار",
    hotelName: "اسم الفندق",
    nameEnPlaceholder: "اسم الفندق بالإنجليزية",
    nameArPlaceholder: "اسم الفندق بالعربية",
    category: "تصنيف الفندق",
    stars: "نجوم الفندق",
    country: "دولة الفندق",
    city: "مدينة الفندق",
    selectCity: "اختر المدينة",
    location: "الموقع / الشارع",
    locationPlaceholder: "اسم الشارع / المنطقة",
    postCode: "الرمز البريدي",
    postCodePlaceholder: "مثال: 11511",
    mapTitle: "تحديد الموقع على الخريطة",
    clearPin: "مسح النقطة",
    mapHint:
      "اضغط في أي مكان على الخريطة لإضافة نقطة، ويمكنك سحبها لتعديل الموقع.",
    next: "التالي -> الوصف",
    errors: {
      name: "اسم الفندق باللغة الإنجليزية مطلوب",
      stars: "يرجى اختيار عدد النجوم",
      city: "المدينة مطلوبة",
    },
    categories: ["فندق", "منتجع", "بوتيك", "نزل", "موتيل", "فيلا"],
    countries: {
      Egypt: "مصر",
      "Saudi Arabia": "السعودية",
      UAE: "الإمارات",
      Jordan: "الأردن",
      Morocco: "المغرب",
      Tunisia: "تونس",
    },
  },
};

const COUNTRY_VALUES = [
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

function LocationPickerMap({ city, country, lat, lng, onPick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

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
      const marker = L.marker([lat, lng], {
        icon: makePinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const point = marker.getLatLng();
        onPick(point.lat, point.lng);
      });

      markerRef.current = marker;
    }

    map.on("click", (event) => {
      const { lat: selectedLat, lng: selectedLng } = event.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([selectedLat, selectedLng]);
      } else {
        const marker = L.marker([selectedLat, selectedLng], {
          icon: makePinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const point = marker.getLatLng();
          onPick(point.lat, point.lng);
        });

        markerRef.current = marker;
      }

      onPick(selectedLat, selectedLng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    if (lat != null) return;
    const query = [city, country].filter(Boolean).join(", ");
    if (!query) return;

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data[0] && mapRef.current) {
          mapRef.current.flyTo(
            [parseFloat(data[0].lat), parseFloat(data[0].lon)],
            12,
          );
        }
      })
      .catch(() => {});
  }, [city, country, lat]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}

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

export default function HotelMainDetailsStep() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const { data: hotels = [] } = useGetHotelsQuery();

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

  useEffect(() => {
    if (sessionStorage.getItem("hotel_details_main") || !hotels.length) return;

    const persistedDraft = buildHotelDraftFromRecord(hotels[0]);
    setForm((prev) => ({ ...prev, ...persistedDraft.main }));
    persistHotelDraftToSession({ main: persistedDraft.main });

    if (hotels[0]?._id) {
      setStoredHotelId(hotels[0]._id);
    }
  }, [hotels]);

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const clearError = (field) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => set("logoDataUrl", loadEvent.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.nameEn.trim()) nextErrors.nameEn = copy.errors.name;
    if (!form.stars) nextErrors.stars = copy.errors.stars;
    if (!form.city.trim()) nextErrors.city = copy.errors.city;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      <div className="mb-8 flex flex-col items-center gap-2">
        <button
          onClick={() => logoInputRef.current?.click()}
          className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full transition-all"
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
                className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
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
          {copy.uploadLogo}
        </span>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              {copy.hotelName}
            </label>
            <LangToggle lang={nameLang} setLang={setNameLang} />
          </div>

          <input
            className="input"
            placeholder={
              nameLang === "en"
                ? copy.nameEnPlaceholder
                : copy.nameArPlaceholder
            }
            dir={nameLang === "ar" ? "rtl" : "ltr"}
            value={nameLang === "en" ? form.nameEn : form.nameAr}
            onChange={(event) => {
              set(nameLang === "en" ? "nameEn" : "nameAr", event.target.value);
              clearError("nameEn");
            }}
          />

          {errors.nameEn && <p className="input-error mt-1">{errors.nameEn}</p>}
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.category}
          </label>
          <div className="relative">
            <select
              className="input appearance-none pr-10"
              value={form.category}
              onChange={(event) => set("category", event.target.value)}
            >
              {copy.categories.map((label, index) => (
                <option
                  key={label}
                  value={
                    ["Hotel", "Resort", "Boutique", "Hostel", "Motel", "Villa"][
                      index
                    ]
                  }
                >
                  {label}
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

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.stars}
          </label>
          <div className="flex h-[42px] items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => {
                  set("stars", value);
                  clearError("stars");
                }}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  fill={value <= form.stars ? "#f59e0b" : "none"}
                  stroke={value <= form.stars ? "#f59e0b" : "var(--border)"}
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

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.country}
          </label>
          <div className="relative">
            <select
              className="input appearance-none pr-10"
              value={form.country}
              onChange={(event) => {
                set("country", event.target.value);
                set("city", "");
              }}
            >
              {COUNTRY_VALUES.map((country) => (
                <option key={country} value={country}>
                  {copy.countries[country]}
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

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.city}
          </label>
          <div className="relative">
            <select
              className="input appearance-none pr-10"
              value={form.city}
              onChange={(event) => {
                set("city", event.target.value);
                clearError("city");
              }}
            >
              <option value="">{copy.selectCity}</option>
              {(CITIES[form.country] || []).map((city) => (
                <option key={city} value={city}>
                  {city}
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

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.location}
          </label>
          <div className="relative">
            <MapPin
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              className="input pl-9"
              placeholder={copy.locationPlaceholder}
              value={form.location}
              onChange={(event) => set("location", event.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-semibold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.postCode}
          </label>
          <input
            className="input"
            placeholder={copy.postCodePlaceholder}
            value={form.postCode}
            onChange={(event) => set("postCode", event.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              {copy.mapTitle}
            </label>
            {form.lat != null && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    set("lat", null);
                    set("lng", null);
                  }}
                  className="rounded-lg px-2 py-0.5 text-xs"
                  style={{
                    color: "var(--danger)",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-raised)",
                  }}
                >
                  {copy.clearPin}
                </button>
              </div>
            )}
          </div>

          <div
            className="w-full overflow-hidden rounded-xl"
            style={{ height: 260, border: "1px solid var(--border)" }}
          >
            <LocationPickerMap
              city={form.city}
              country={form.country}
              lat={form.lat}
              lng={form.lng}
              onPick={(lat, lng) => {
                set("lat", lat);
                set("lng", lng);
              }}
            />
          </div>

          <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {copy.mapHint}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="btn btn-primary w-full rounded-2xl py-3 text-base"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {copy.next}
        </button>
      </div>
    </div>
  );
}
