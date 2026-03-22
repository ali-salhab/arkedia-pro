import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, ChevronDown, Camera } from "lucide-react";
import ActivityDetailsStepBar from "../../components/ActivityDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const COPY = {
  en: {
    uploadLogo: "Upload Logo",
    activityName: "Activity Name",
    nameEnPlaceholder: "Activity name in English",
    nameArPlaceholder: "Activity name in Arabic",
    category: "Activity Category",
    country: "Country",
    city: "City",
    selectCity: "Select city",
    location: "Location / Address",
    locationPlaceholder: "Street / area name",
    next: "Next -> Description",
    errors: {
      name: "Activity name in English is required",
      city: "City is required",
    },
    categories: [
      "Adventure",
      "Cultural",
      "Sports",
      "Water Sports",
      "Desert",
      "City Tour",
      "Mountain",
      "Wildlife",
      "Wellness",
    ],
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
    activityName: "اسم النشاط",
    nameEnPlaceholder: "اسم النشاط بالإنجليزية",
    nameArPlaceholder: "اسم النشاط بالعربية",
    category: "تصنيف النشاط",
    country: "الدولة",
    city: "المدينة",
    selectCity: "اختر المدينة",
    location: "الموقع / العنوان",
    locationPlaceholder: "اسم الشارع / المنطقة",
    next: "التالي -> الوصف",
    errors: {
      name: "اسم النشاط بالإنجليزية مطلوب",
      city: "المدينة مطلوبة",
    },
    categories: [
      "مغامرة",
      "ثقافي",
      "رياضي",
      "رياضات مائية",
      "صحراوي",
      "جولة مدينة",
      "جبلي",
      "حياة برية",
      "صحة ورفاهية",
    ],
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
  "Saudi Arabia": [
    "Riyadh",
    "Jeddah",
    "Mecca",
    "Medina",
    "Dammam",
    "AlUla",
    "Tabuk",
  ],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah"],
  Jordan: ["Amman", "Aqaba", "Petra", "Wadi Rum"],
  Morocco: ["Casablanca", "Marrakech", "Fez", "Agadir"],
  Tunisia: ["Tunis", "Sfax", "Sousse", "Djerba"],
};

const STORAGE_KEY = "activity_details_main";

function loadSaved() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
  } catch {
    return {};
  }
}

export default function ActivityMainDetailsStep() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const saved = loadSaved();

  const [logoDataUrl, setLogoDataUrl] = useState(saved.logoDataUrl || "");
  const [nameEn, setNameEn] = useState(saved.nameEn || "");
  const [nameAr, setNameAr] = useState(saved.nameAr || "");
  const [category, setCategory] = useState(saved.category || "");
  const [country, setCountry] = useState(saved.country || "Egypt");
  const [city, setCity] = useState(saved.city || "");
  const [location, setLocation] = useState(saved.location || "");
  const [errors, setErrors] = useState({});

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCountryChange = (val) => {
    setCountry(val);
    setCity("");
  };

  const validate = () => {
    const err = {};
    if (!nameEn.trim()) err.name = copy.errors.name;
    if (!city) err.city = copy.errors.city;
    return err;
  };

  const handleNext = () => {
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        logoDataUrl,
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        category,
        country,
        city,
        location: location.trim(),
      }),
    );
    navigate("/activity/details/description");
  };

  const cities = CITIES[country] || [];
  const selectClass = "input w-full text-sm appearance-none";

  return (
    <div className="page-shell">
      <ActivityDetailsStepBar />
      <div className="space-y-5">
        {/* Logo */}
        <div className="card flex flex-col items-center gap-3 py-6">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogo}
          />
          <div
            onClick={() => logoInputRef.current?.click()}
            className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-2xl group"
            style={{
              backgroundColor: "var(--bg-raised)",
              border: "2px dashed var(--border)",
            }}
          >
            {logoDataUrl ? (
              <>
                <img
                  src={logoDataUrl}
                  alt="logo"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                <Upload size={22} style={{ color: "var(--text-muted)" }} />
                <span
                  className="text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {copy.uploadLogo}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="text-xs font-semibold underline"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.uploadLogo}
          </button>
        </div>

        {/* Names */}
        <div className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">{copy.activityName} (EN) *</label>
            <input
              className={`input w-full text-sm${errors.name ? " border-red-500" : ""}`}
              value={nameEn}
              onChange={(e) => {
                setNameEn(e.target.value);
                setErrors((v) => ({ ...v, name: "" }));
              }}
              placeholder={copy.nameEnPlaceholder}
              dir="ltr"
            />
            {errors.name && <p className="input-error">{errors.name}</p>}
          </div>
          <div>
            <label className="label-text">{copy.activityName} (AR)</label>
            <input
              className="input w-full text-sm"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={copy.nameArPlaceholder}
              dir="rtl"
            />
          </div>
        </div>

        {/* Category */}
        <div className="card">
          <label className="label-text">{copy.category}</label>
          <div className="relative">
            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{copy.category}</option>
              {COPY.en.categories.map((cat, i) => (
                <option key={cat} value={cat}>
                  {copy.categories[i] || cat}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>

        {/* Location */}
        <div className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">{copy.country}</label>
            <div className="relative">
              <select
                className={selectClass}
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                {COUNTRY_VALUES.map((c) => (
                  <option key={c} value={c}>
                    {copy.countries[c] || c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          </div>
          <div>
            <label className="label-text">{copy.city} *</label>
            <div className="relative">
              <select
                className={`${selectClass}${errors.city ? " border-red-500" : ""}`}
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setErrors((v) => ({ ...v, city: "" }));
                }}
              >
                <option value="">{copy.selectCity}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            {errors.city && <p className="input-error">{errors.city}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">
              <MapPin size={12} className="inline me-1" />
              {copy.location}
            </label>
            <input
              className="input w-full text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={copy.locationPlaceholder}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="btn btn-primary rounded-2xl px-8 py-3 text-sm font-semibold"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}
          >
            {copy.next}
          </button>
        </div>
      </div>
    </div>
  );
}
