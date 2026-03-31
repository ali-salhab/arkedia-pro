import { useRef, useState } from "react";
import { Images, Hotel, Utensils, Zap, Package, Upload, Save } from "lucide-react";
import { useAppSetting } from "../../hooks/useAppSetting";
import { useLanguage } from "../../context/LanguageContext";

const CATEGORIES = [
  { key: "hotels",      labelAr: "فنادق",    labelEn: "Hotels",       Icon: Hotel,    color: "#3b82f6" },
  { key: "activities",  labelAr: "أنشطة",    labelEn: "Activities",   Icon: Zap,      color: "#10b981" },
  { key: "packages",    labelAr: "باكدج",    labelEn: "Packages",     Icon: Package,  color: "#f59e0b" },
  { key: "restaurants", labelAr: "مطاعم",    labelEn: "Restaurants",  Icon: Utensils, color: "#ef4444" },
];

const TXT = {
  ar: {
    title:    "صور فئات الصفحة الرئيسية",
    subtitle: "إدارة صور الخلفية لكل فئة في محرك البحث",
    bgLabel:  "صورة خلفية الفئة",
    urlLabel: "رابط الصورة",
    urlPlaceholder: "https://example.com/image.jpg",
    upload:   "رفع صورة",
    save:     "حفظ",
    saved:    "تم الحفظ",
  },
  en: {
    title:    "Main Page Category Photos",
    subtitle: "Manage background images for each category in the search engine",
    bgLabel:  "Category background image",
    urlLabel: "Image URL",
    urlPlaceholder: "https://example.com/image.jpg",
    upload:   "Upload photo",
    save:     "Save",
    saved:    "Saved",
  },
};

function resizeImage(file, maxW = 1280, maxH = 720, quality = 0.85) {
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

export default function MainPagePhotosPage() {
  const { lang } = useLanguage();
  const t  = TXT[lang] || TXT.ar;
  const dir = lang === "en" ? "ltr" : "rtl";

  const [photos, setPhotos] = useAppSetting("main_page_photos", {});
  const [urls,   setUrls]   = useState(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, photos[c.key]?.url || ""]))
  );
  const [saved,  setSaved]  = useState({});
  const fileRefs = useRef({});

  async function handleFileChange(catKey, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImage(file);
    setUrls((p) => ({ ...p, [catKey]: "" }));
    setPhotos((p) => ({ ...p, [catKey]: { type: "upload", src: b64 } }));
    setSaved((p) => ({ ...p, [catKey]: true }));
    setTimeout(() => setSaved((p) => ({ ...p, [catKey]: false })), 2000);
  }

  function handleSaveUrl(catKey) {
    const url = urls[catKey]?.trim();
    if (!url) return;
    setPhotos((p) => ({ ...p, [catKey]: { type: "url", src: url } }));
    setSaved((p) => ({ ...p, [catKey]: true }));
    setTimeout(() => setSaved((p) => ({ ...p, [catKey]: false })), 2000);
  }

  const currentSrc = (catKey) => {
    const stored = photos[catKey];
    if (stored?.src) return stored.src;
    return null;
  };

  return (
    <div className="page-shell" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ backgroundColor: "#ede9fe" }}>
          <Images size={22} style={{ color: "#7c3aed" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t.title}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Category cards */}
      <div className="space-y-5">
        {CATEGORIES.map(({ key, labelAr, labelEn, Icon, color }) => {
          const label = lang === "en" ? labelEn : labelAr;
          const src   = currentSrc(key);
          return (
            <div
              key={key}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} style={{ color }} />
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.bgLabel}</p>
                </div>
              </div>

              {/* Preview */}
              {src && (
                <div className="rounded-xl overflow-hidden mb-4 h-40 w-full relative">
                  <img src={src} alt={label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
                  <span className="absolute bottom-3 left-0 right-0 text-center text-white text-lg font-bold drop-shadow">{label}</span>
                </div>
              )}

              {/* URL input */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1.5 text-right" style={{ color: "var(--text-secondary)" }}>
                  {t.urlLabel}
                </label>
                <input
                  value={urls[key]}
                  onChange={(e) => setUrls((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={t.urlPlaceholder}
                  className="input w-full"
                  style={{ textAlign: "right", direction: "ltr" }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSaveUrl(key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  <Save size={15} />
                  {saved[key] ? t.saved : t.save}
                </button>
                <input
                  ref={(el) => { fileRefs.current[key] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(key, e)}
                />
                <button
                  onClick={() => fileRefs.current[key]?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Upload size={15} />
                  {t.upload}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
