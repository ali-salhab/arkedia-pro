import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, Star, ChevronDown, Camera } from "lucide-react";
import RestaurantDetailsStepBar from "../../components/RestaurantDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const COPY = {
  en: {
    uploadLogo: "Upload Logo",
    restaurantName: "Restaurant Name",
    nameEnPlaceholder: "Restaurant name in English",
    nameArPlaceholder: "Restaurant name in Arabic",
    category: "Restaurant Category",
    cuisine: "Cuisine Type",
    stars: "Rating Stars",
    country: "Country",
    city: "City",
    selectCity: "Select city",
    location: "Location / Street",
    locationPlaceholder: "Street / Area name",
    next: "Next -> Description",
    errors: {
      name: "Restaurant name in English is required",
      city: "City is required",
    },
    categories: [
      "Restaurant",
      "Cafe",
      "Fast Food",
      "Fine Dining",
      "Buffet",
      "Bakery",
    ],
    cuisines: [
      "Egyptian",
      "Italian",
      "Chinese",
      "Lebanese",
      "Turkish",
      "Indian",
      "American",
      "French",
      "Mixed",
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
    restaurantName: "اسم المطعم",
    nameEnPlaceholder: "اسم المطعم بالإنجليزية",
    nameArPlaceholder: "اسم المطعم بالعربية",
    category: "تصنيف المطعم",
    cuisine: "نوع المطبخ",
    stars: "عدد النجوم",
    country: "الدولة",
    city: "المدينة",
    selectCity: "اختر المدينة",
    location: "الموقع / الشارع",
    locationPlaceholder: "اسم الشارع / المنطقة",
    next: "التالي -> الوصف",
    errors: {
      name: "اسم المطعم باللغة الإنجليزية مطلوب",
      city: "المدينة مطلوبة",
    },
    categories: ["مطعم", "كافيه", "وجبات سريعة", "مطعم فاخر", "بوفيه", "مخبز"],
    cuisines: [
      "مصري",
      "إيطالي",
      "صيني",
      "لبناني",
      "تركي",
      "هندي",
      "أمريكي",
      "فرنسي",
      "متنوع",
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
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
  Jordan: ["Amman", "Aqaba", "Petra", "Irbid"],
  Morocco: ["Casablanca", "Marrakech", "Fez", "Rabat"],
  Tunisia: ["Tunis", "Sfax", "Sousse", "Hammamet"],
};

const STORAGE_KEY = "restaurant_details_main";

function loadSaved() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
  } catch {
    return {};
  }
}

export default function RestaurantMainDetailsStep() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const saved = loadSaved();

  const [logoDataUrl, setLogoDataUrl] = useState(saved.logoDataUrl || "");
  const [nameEn, setNameEn] = useState(saved.nameEn || "");
  const [nameAr, setNameAr] = useState(saved.nameAr || "");
  const [category, setCategory] = useState(saved.category || "");
  const [cuisine, setCuisine] = useState(saved.cuisine || "");
  const [stars, setStars] = useState(saved.stars || 0);
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
    const errs = {};
    if (!nameEn.trim()) errs.name = copy.errors.name;
    if (!city) errs.city = copy.errors.city;
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        logoDataUrl,
        nameEn,
        nameAr,
        category,
        cuisine,
        stars,
        country,
        city,
        location,
      }),
    );
    navigate("/restaurant/details/description");
  };

  return (
    <div className="page-shell">
      <RestaurantDetailsStepBar />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* Logo */}
          <div className="card flex items-center gap-5">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl transition hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "2px dashed var(--border)",
              }}
            >
              {logoDataUrl ? (
                <img
                  src={logoDataUrl}
                  alt="logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera size={24} style={{ color: "var(--text-muted)" }} />
              )}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogo}
            />
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {copy.uploadLogo}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>

          {/* Names */}
          <div className="card space-y-4">
            <h3
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {copy.restaurantName}
            </h3>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder={copy.nameEnPlaceholder}
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value);
                  setErrors((p) => ({ ...p, name: "" }));
                }}
              />
              {errors.name && <p className="input-error">{errors.name}</p>}
              <input
                className="input w-full"
                placeholder={copy.nameArPlaceholder}
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>

          {/* Category & Cuisine */}
          <div className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block mb-1.5 text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {copy.category}
              </label>
              <div className="relative">
                <select
                  className="select w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">—</option>
                  {copy.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                  style={{
                    insetInlineEnd: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>
            <div>
              <label
                className="block mb-1.5 text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {copy.cuisine}
              </label>
              <div className="relative">
                <select
                  className="select w-full"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                >
                  <option value="">—</option>
                  {copy.cuisines.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                  style={{
                    insetInlineEnd: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stars */}
          <div className="card">
            <label
              className="block mb-2 text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {copy.stars}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  className="p-1 transition"
                  style={{ color: s <= stars ? "#f59e0b" : "var(--border)" }}
                >
                  <Star
                    size={28}
                    fill={s <= stars ? "#f59e0b" : "none"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="card space-y-4">
            <h3
              className="font-semibold text-sm flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <MapPin size={15} /> {copy.location}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="block mb-1 text-xs font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {copy.country}
                </label>
                <div className="relative">
                  <select
                    className="select w-full"
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
                    size={14}
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                    style={{
                      insetInlineEnd: "0.75rem",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block mb-1 text-xs font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {copy.city}
                </label>
                <div className="relative">
                  <select
                    className="select w-full"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setErrors((p) => ({ ...p, city: "" }));
                    }}
                  >
                    <option value="">{copy.selectCity}</option>
                    {(CITIES[country] || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2"
                    style={{
                      insetInlineEnd: "0.75rem",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>
                {errors.city && (
                  <p className="input-error mt-1">{errors.city}</p>
                )}
              </div>
            </div>
            <input
              className="input w-full"
              placeholder={copy.locationPlaceholder}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Side hint */}
        <div className="card h-fit">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍽️</span>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {lang === "ar" ? "بيانات المطعم" : "Restaurant Info"}
            </span>
          </div>
          <ul
            className="space-y-2 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {(lang === "ar"
              ? [
                  "أدخل اسم المطعم باللغتين",
                  "حدد النوع والمطبخ بدقة",
                  "اختر تقييم النجوم المناسب",
                  "أدخل الموقع الصحيح",
                ]
              : [
                  "Enter name in both languages",
                  "Choose the right category & cuisine",
                  "Set an accurate star rating",
                  "Fill in the correct location",
                ]
            ).map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span style={{ color: "var(--brand)" }}>·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleNext}
          className="btn btn-primary px-8 py-3 text-sm font-semibold rounded-2xl"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {copy.next} ›
        </button>
      </div>
    </div>
  );
}
