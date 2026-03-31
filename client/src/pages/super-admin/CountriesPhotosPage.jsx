import { useRef, useState } from "react";
import { Globe, ChevronDown, Search, Upload, Plus, X, Check, Trash2 } from "lucide-react";
import { useAppSetting } from "../../hooks/useAppSetting";
import { useLanguage } from "../../context/LanguageContext";

const SEED_COUNTRIES = [
  { code: "BH", nameEn: "Bahrain",      nameAr: "البحرين",   cities: [{ en: "Manama", ar: "المنامة" }, { en: "Muharraq", ar: "المحرق" }, { en: "Riffa", ar: "الرفاع" }] },
  { code: "EG", nameEn: "Egypt",        nameAr: "مصر",       cities: [{ en: "Cairo", ar: "القاهرة" }, { en: "Alexandria", ar: "الإسكندرية" }, { en: "Hurghada", ar: "الغردقة" }, { en: "Sharm El-Sheikh", ar: "شرم الشيخ" }, { en: "Luxor", ar: "الأقصر" }, { en: "Aswan", ar: "أسوان" }, { en: "Giza", ar: "الجيزة" }, { en: "Port Said", ar: "بورسعيد" }] },
  { code: "IQ", nameEn: "Iraq",         nameAr: "العراق",    cities: [{ en: "Baghdad", ar: "بغداد" }, { en: "Basra", ar: "البصرة" }, { en: "Erbil", ar: "أربيل" }, { en: "Najaf", ar: "النجف" }, { en: "Karbala", ar: "كربلاء" }, { en: "Mosul", ar: "الموصل" }] },
  { code: "JO", nameEn: "Jordan",       nameAr: "الأردن",    cities: [{ en: "Amman", ar: "عمان" }, { en: "Aqaba", ar: "العقبة" }, { en: "Petra", ar: "البتراء" }, { en: "Jerash", ar: "جرش" }, { en: "Zarqa", ar: "الزرقاء" }, { en: "Wadi Rum", ar: "وادي رم" }] },
  { code: "KW", nameEn: "Kuwait",       nameAr: "الكويت",    cities: [{ en: "Kuwait City", ar: "مدينة الكويت" }, { en: "Hawalli", ar: "حولي" }, { en: "Salmiya", ar: "السالمية" }, { en: "Jahra", ar: "الجهراء" }, { en: "Ahmadi", ar: "الأحمدي" }] },
  { code: "LB", nameEn: "Lebanon",      nameAr: "لبنان",     cities: [{ en: "Beirut", ar: "بيروت" }, { en: "Tripoli", ar: "طرابلس" }, { en: "Sidon", ar: "صيدا" }, { en: "Tyre", ar: "صور" }, { en: "Byblos", ar: "جبيل" }] },
  { code: "MA", nameEn: "Morocco",      nameAr: "المغرب",    cities: [{ en: "Marrakech", ar: "مراكش" }, { en: "Casablanca", ar: "الدار البيضاء" }, { en: "Fes", ar: "فاس" }, { en: "Rabat", ar: "الرباط" }, { en: "Agadir", ar: "أغادير" }] },
  { code: "OM", nameEn: "Oman",         nameAr: "عُمان",     cities: [{ en: "Muscat", ar: "مسقط" }, { en: "Salalah", ar: "صلالة" }, { en: "Nizwa", ar: "نزوى" }, { en: "Sur", ar: "صور" }, { en: "Sohar", ar: "صحار" }] },
  { code: "QA", nameEn: "Qatar",        nameAr: "قطر",       cities: [{ en: "Doha", ar: "الدوحة" }, { en: "Al Khor", ar: "الخور" }, { en: "Lusail", ar: "لوسيل" }, { en: "Dukhan", ar: "دخان" }] },
  { code: "SA", nameEn: "Saudi Arabia", nameAr: "السعودية",  cities: [{ en: "Riyadh", ar: "الرياض" }, { en: "Jeddah", ar: "جدة" }, { en: "Mecca", ar: "مكة المكرمة" }, { en: "Medina", ar: "المدينة المنورة" }, { en: "Dammam", ar: "الدمام" }, { en: "Abha", ar: "أبها" }, { en: "Al Ula", ar: "العُلا" }] },
  { code: "TN", nameEn: "Tunisia",      nameAr: "تونس",      cities: [{ en: "Tunis", ar: "تونس" }, { en: "Sousse", ar: "سوسة" }, { en: "Djerba", ar: "جربة" }, { en: "Sfax", ar: "صفاقس" }] },
  { code: "AE", nameEn: "UAE",          nameAr: "الإمارات",  cities: [{ en: "Dubai", ar: "دبي" }, { en: "Abu Dhabi", ar: "أبوظبي" }, { en: "Sharjah", ar: "الشارقة" }, { en: "Ajman", ar: "عجمان" }, { en: "Ras Al Khaimah", ar: "رأس الخيمة" }, { en: "Fujairah", ar: "الفجيرة" }] },
  { code: "TR", nameEn: "Turkey",       nameAr: "تركيا",     cities: [{ en: "Istanbul", ar: "إسطنبول" }, { en: "Ankara", ar: "أنقرة" }, { en: "Antalya", ar: "أنطاليا" }, { en: "Cappadocia", ar: "كابادوكيا" }, { en: "Bodrum", ar: "بودروم" }] },
  { code: "GR", nameEn: "Greece",       nameAr: "اليونان",   cities: [{ en: "Athens", ar: "أثينا" }, { en: "Santorini", ar: "سانتوريني" }, { en: "Mykonos", ar: "ميكونوس" }, { en: "Rhodes", ar: "رودس" }, { en: "Crete", ar: "كريت" }] },
  { code: "IT", nameEn: "Italy",        nameAr: "إيطاليا",   cities: [{ en: "Rome", ar: "روما" }, { en: "Venice", ar: "البندقية" }, { en: "Florence", ar: "فلورنسا" }, { en: "Milan", ar: "ميلانو" }, { en: "Amalfi", ar: "أمالفي" }] },
];

const TXT = {
  ar: {
    title:        "صور الدول والمدن",
    subtitle:     "إدارة صور الدول والمدن المعروضة في الصفحة الرئيسية",
    search:       "ابحث عن دولة أو مدينة...",
    addCountry:   "إضافة دولة",
    addCity:      "إضافة مدينة",
    cities:       "مدينة",
    withPhoto:    "صورة ✓",
    noPhoto:      "بدون صورة ✗",
    citiesPhotos: "مدن بصور",
    upload:       "رفع صورة",
    nameEn:       "الاسم (إنجليزي)",
    nameAr:       "الاسم (عربي)",
    code:         "الرمز (مثل: SA)",
    save:         "حفظ",
    cancel:       "إلغاء",
    deleteCity:   "حذف المدينة",
    deleteCountry:"حذف الدولة",
  },
  en: {
    title:        "Countries & Cities Photos",
    subtitle:     "Manage country and city photos shown on the home page",
    search:       "Search country or city...",
    addCountry:   "Add Country",
    addCity:      "Add City",
    cities:       "Cities",
    withPhoto:    "✓ Photo",
    noPhoto:      "✗ No photo",
    citiesPhotos: "cities with photos",
    upload:       "Upload Photo",
    nameEn:       "Name (English)",
    nameAr:       "Name (Arabic)",
    code:         "Code (e.g. SA)",
    save:         "Save",
    cancel:       "Cancel",
    deleteCity:   "Remove city",
    deleteCountry:"Remove country",
  },
};

function resizeImage(file, maxW = 960, maxH = 640, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function CountriesPhotosPage() {
  const { lang } = useLanguage();
  const t   = TXT[lang] || TXT.ar;
  const dir = lang === "en" ? "ltr" : "rtl";

  const [countries, setCountries] = useAppSetting("countries_list", SEED_COUNTRIES);
  const [photos, setPhotos]       = useAppSetting("countries_photos", {});

  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState({});
  const fileRefs = useRef({});

  const [addCountryOpen, setAddCountryOpen] = useState(false);
  const [newCountry, setNewCountry] = useState({ code: "", nameEn: "", nameAr: "" });

  const [addCityOpen, setAddCityOpen] = useState({});
  const [newCity, setNewCity]         = useState({});

  const filtered = countries.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nameEn.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.cities.some((ci) => ci.en.toLowerCase().includes(q) || ci.ar.includes(q))
    );
  });

  const totalCountries   = countries.length;
  const countriesWithPic = countries.filter((c) => photos[c.code]?.src).length;
  const totalCities      = countries.reduce((a, c) => a + c.cities.length, 0);
  const citiesWithPic    = countries.reduce((a, c) =>
    a + c.cities.filter((ci) => photos[c.code]?.cities?.[ci.en]?.src).length, 0);

  function toggleExpand(code) {
    setExpanded((p) => ({ ...p, [code]: !p[code] }));
  }

  async function handleCountryFile(code, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImage(file);
    setPhotos((p) => ({ ...p, [code]: { ...(p[code] || {}), src: b64 } }));
    e.target.value = "";
  }

  function removeCountryPhoto(code) {
    setPhotos((p) => ({ ...p, [code]: { ...(p[code] || {}), src: null } }));
  }

  async function handleCityFile(code, cityEn, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImage(file);
    setPhotos((p) => ({
      ...p,
      [code]: {
        ...(p[code] || {}),
        cities: { ...(p[code]?.cities || {}), [cityEn]: { src: b64 } },
      },
    }));
    e.target.value = "";
  }

  function removeCityPhoto(code, cityEn) {
    setPhotos((p) => ({
      ...p,
      [code]: {
        ...(p[code] || {}),
        cities: { ...(p[code]?.cities || {}), [cityEn]: { src: null } },
      },
    }));
  }

  function handleAddCountry() {
    if (!newCountry.nameEn.trim() || !newCountry.code.trim()) return;
    const code = newCountry.code.toUpperCase();
    if (countries.some((c) => c.code === code)) return;
    setCountries((p) => [...p, { code, nameEn: newCountry.nameEn.trim(), nameAr: newCountry.nameAr.trim(), cities: [] }]);
    setNewCountry({ code: "", nameEn: "", nameAr: "" });
    setAddCountryOpen(false);
  }

  function handleRemoveCountry(code) {
    setCountries((p) => p.filter((c) => c.code !== code));
    setPhotos((p) => { const copy = { ...p }; delete copy[code]; return copy; });
  }

  function handleAddCity(code) {
    const city = newCity[code];
    if (!city?.en?.trim()) return;
    setCountries((p) => p.map((c) =>
      c.code === code
        ? { ...c, cities: [...c.cities, { en: city.en.trim(), ar: city.ar?.trim() || city.en.trim() }] }
        : c
    ));
    setNewCity((p) => ({ ...p, [code]: { en: "", ar: "" } }));
    setAddCityOpen((p) => ({ ...p, [code]: false }));
  }

  function handleRemoveCity(code, cityEn) {
    setCountries((p) => p.map((c) =>
      c.code === code ? { ...c, cities: c.cities.filter((ci) => ci.en !== cityEn) } : c
    ));
    removeCityPhoto(code, cityEn);
  }

  return (
    <div className="page-shell" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: "#e0f2fe" }}>
            <Globe size={22} style={{ color: "#0284c7" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t.title}</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {totalCountries} {lang === "ar" ? "دولة" : "Countries"} •{" "}
              {countriesWithPic} {lang === "ar" ? "بصور" : "with photos"} •{" "}
              {citiesWithPic}/{totalCities} {t.citiesPhotos}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAddCountryOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          <Plus size={15} />
          {t.addCountry}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ insetInlineEnd: "1rem", color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="input w-full"
          style={{ paddingInlineEnd: "2.8rem" }}
        />
      </div>

      {/* Country list */}
      <div className="space-y-3">
        {filtered.map((country) => {
          const isOpen          = !!expanded[country.code];
          const countryPhoto    = photos[country.code];
          const cityPhotos      = countryPhoto?.cities || {};
          const citiesWithPhoto = country.cities.filter((c) => cityPhotos[c.en]?.src).length;
          const hasCountryPhoto = !!countryPhoto?.src;

          return (
            <div key={country.code} className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>

              {/* Country header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={() => toggleExpand(country.code)} className="shrink-0">
                  <ChevronDown size={18}
                    style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>

                <button type="button" onClick={() => toggleExpand(country.code)} className="flex items-center gap-3 flex-1 min-w-0" dir="ltr">
                  {hasCountryPhoto ? (
                    <img src={countryPhoto.src} alt={country.nameEn} className="w-12 h-8 object-cover rounded-lg shrink-0" />
                  ) : (
                    <img src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                      alt={country.code} className="w-12 h-8 object-cover rounded-lg shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <div className="text-right flex-1">
                    <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {country.nameEn}{" "}
                      <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>{country.code}</span>
                    </span>
                    <span className="text-xs block" style={{ color: "var(--text-secondary)" }}>({country.nameAr})</span>
                  </div>
                </button>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold" style={{ color: hasCountryPhoto ? "#10b981" : "#f59e0b" }}>
                    {hasCountryPhoto ? t.withPhoto : t.noPhoto}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {country.cities.length} {t.cities}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {citiesWithPhoto}/{country.cities.length}
                  </span>
                </div>

                <button type="button" onClick={() => handleRemoveCountry(country.code)}
                  title={t.deleteCountry}
                  className="p-1.5 rounded-lg shrink-0 hover:opacity-70"
                  style={{ color: "#ef4444" }}>
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Expanded body */}
              {isOpen && (
                <div className="border-t px-4 pb-5 pt-4 space-y-4"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-raised)" }}>

                  {/* Country photo card */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <p className="text-sm font-bold mb-3 text-right" style={{ color: "var(--sidebar-active-text)" }}>
                      {lang === "ar" ? `صورة ${country.nameAr}` : `${country.nameEn} Photo`}
                    </p>

                    {hasCountryPhoto && (
                      <div className="relative rounded-xl overflow-hidden h-40 mb-3">
                        <img src={countryPhoto.src} alt={country.nameEn} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeCountryPhoto(country.code)}
                          className="absolute top-2 left-2 w-7 h-7 rounded-full grid place-items-center bg-black/50 text-white">
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <input type="file" accept="image/*" className="hidden"
                      ref={(el) => { fileRefs.current[country.code] = el; }}
                      onChange={(e) => handleCountryFile(country.code, e)} />
                    <button
                      onClick={() => fileRefs.current[country.code]?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: "var(--sidebar-active-text)" }}
                    >
                      <Upload size={15} />
                      {t.upload}
                    </button>
                  </div>

                  {/* Cities grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {country.cities.map((city) => {
                      const cityPhoto    = cityPhotos[city.en];
                      const hasCityPhoto = !!cityPhoto?.src;
                      const cityFileKey  = `${country.code}::${city.en}`;
                      return (
                        <div key={city.en} className="rounded-xl p-3"
                          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>

                          <div className="flex items-center justify-between mb-2">
                            <button type="button" onClick={() => handleRemoveCity(country.code, city.en)}
                              title={t.deleteCity}
                              className="p-1 rounded hover:opacity-70" style={{ color: "#ef4444" }}>
                              <Trash2 size={13} />
                            </button>
                            <div className="text-right">
                              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{city.en}</p>
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{city.ar}</p>
                            </div>
                          </div>

                          <span className="text-xs font-semibold block text-right mb-2"
                            style={{ color: hasCityPhoto ? "#10b981" : "#f59e0b" }}>
                            {hasCityPhoto ? t.withPhoto : t.noPhoto}
                          </span>

                          {hasCityPhoto && (
                            <div className="relative rounded-lg overflow-hidden h-24 mb-2">
                              <img src={cityPhoto.src} alt={city.en} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeCityPhoto(country.code, city.en)}
                                className="absolute top-1 left-1 w-6 h-6 rounded-full grid place-items-center bg-black/50 text-white">
                                <X size={12} />
                              </button>
                            </div>
                          )}

                          <input type="file" accept="image/*" className="hidden"
                            ref={(el) => { fileRefs.current[cityFileKey] = el; }}
                            onChange={(e) => handleCityFile(country.code, city.en, e)} />
                          <button
                            onClick={() => fileRefs.current[cityFileKey]?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold w-full justify-center"
                            style={{
                              backgroundColor: hasCityPhoto ? "var(--bg-raised)" : "var(--sidebar-active-text)",
                              border: hasCityPhoto ? "1px solid var(--border)" : "none",
                              color: hasCityPhoto ? "var(--text-secondary)" : "white"
                            }}
                          >
                            <Upload size={13} />
                            {t.upload}
                          </button>
                        </div>
                      );
                    })}

                    {/* Add city card */}
                    {!addCityOpen[country.code] ? (
                      <button
                        type="button"
                        onClick={() => setAddCityOpen((p) => ({ ...p, [country.code]: true }))}
                        className="rounded-xl flex flex-col items-center justify-center gap-2 py-6 text-sm font-semibold transition-colors hover:opacity-80"
                        style={{ border: "2px dashed var(--border)", color: "var(--sidebar-active-text)", backgroundColor: "var(--bg-surface)" }}
                      >
                        <Plus size={20} />
                        {t.addCity}
                      </button>
                    ) : (
                      <div className="rounded-xl p-3 space-y-2"
                        style={{ backgroundColor: "var(--bg-surface)", border: "1.5px solid var(--sidebar-active-text)" }}>
                        <p className="text-xs font-bold text-right" style={{ color: "var(--sidebar-active-text)" }}>{t.addCity}</p>
                        <input
                          value={newCity[country.code]?.en || ""}
                          onChange={(e) => setNewCity((p) => ({ ...p, [country.code]: { ...(p[country.code] || {}), en: e.target.value } }))}
                          placeholder={t.nameEn}
                          className="input w-full text-xs"
                          style={{ direction: "ltr" }}
                        />
                        <input
                          value={newCity[country.code]?.ar || ""}
                          onChange={(e) => setNewCity((p) => ({ ...p, [country.code]: { ...(p[country.code] || {}), ar: e.target.value } }))}
                          placeholder={t.nameAr}
                          className="input w-full text-xs"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleAddCity(country.code)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                            style={{ backgroundColor: "var(--sidebar-active-text)" }}>
                            <Check size={14} className="inline mr-1" />{t.save}
                          </button>
                          <button onClick={() => setAddCityOpen((p) => ({ ...p, [country.code]: false }))}
                            className="flex-1 py-2 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Country Modal */}
      {addCountryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }} dir={dir}>
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setAddCountryOpen(false)}
                className="h-7 w-7 grid place-items-center rounded-lg"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-raised)" }}>
                <X size={16} />
              </button>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{t.addCountry}</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-right" style={{ color: "var(--text-secondary)" }}>{t.nameEn}</label>
                <input value={newCountry.nameEn}
                  onChange={(e) => setNewCountry((p) => ({ ...p, nameEn: e.target.value }))}
                  className="input w-full" style={{ direction: "ltr" }} placeholder="e.g. France" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-right" style={{ color: "var(--text-secondary)" }}>{t.nameAr}</label>
                <input value={newCountry.nameAr}
                  onChange={(e) => setNewCountry((p) => ({ ...p, nameAr: e.target.value }))}
                  className="input w-full" placeholder="مثال: فرنسا" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-right" style={{ color: "var(--text-secondary)" }}>{t.code}</label>
                <input value={newCountry.code}
                  onChange={(e) => setNewCountry((p) => ({ ...p, code: e.target.value.toUpperCase().slice(0, 2) }))}
                  className="input w-full" style={{ direction: "ltr" }} placeholder="FR" maxLength={2} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleAddCountry}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}>
                  {t.save}
                </button>
                <button onClick={() => setAddCountryOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}