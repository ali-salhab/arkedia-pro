import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Plus, X, Camera } from "lucide-react";
import ActivityDetailsStepBar from "../../components/ActivityDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const COPY = {
  en: {
    mainPhoto: "Main Photo",
    gallery: "Photo Gallery",
    changePhoto: "Change photo",
    uploadMain: "Click to upload main photo",
    recommended: "Recommended: 1920 x 1080 px",
    add: "Add",
    hint: "Add up to 10 photos showcasing your activity, location, and experience.",
    save: "Save & View Details",
    saving: "Saving...",
    errorMain: "Please upload a main photo before saving",
    back: "Back",
  },
  ar: {
    mainPhoto: "الصورة الرئيسية",
    gallery: "معرض الصور",
    changePhoto: "تغيير الصورة",
    uploadMain: "اضغط لرفع الصورة الرئيسية",
    recommended: "المقاس المقترح: 1920 × 1080",
    add: "إضافة",
    hint: "أضف حتى 10 صور توضح النشاط والموقع والتجربة.",
    save: "حفظ وعرض التفاصيل",
    saving: "جارٍ الحفظ...",
    errorMain: "يرجى رفع صورة رئيسية قبل الحفظ",
    back: "رجوع",
  },
};

const STORAGE_KEY = "activity_details_photos";

export default function ActivityPhotosStep() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const saved = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
    } catch {
      return {};
    }
  })();

  const [mainPhotoDataUrl, setMainPhotoDataUrl] = useState(
    saved.mainPhotoDataUrl || "",
  );
  const [galleryDataUrls, setGalleryDataUrls] = useState(
    saved.galleryDataUrls || [],
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleMain = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMainPhotoDataUrl(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGallery = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      const remaining = 10 - galleryDataUrls.length;
      files.slice(0, remaining).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () =>
          setGalleryDataUrls((prev) =>
            prev.length < 10 ? [...prev, reader.result] : prev,
          );
        reader.readAsDataURL(file);
      });
    },
    [galleryDataUrls.length],
  );

  const removeGallery = (idx) =>
    setGalleryDataUrls((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!mainPhotoDataUrl) {
      setError(copy.errorMain);
      return;
    }
    setSaving(true);
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mainPhotoDataUrl, galleryDataUrls }),
    );
    navigate("/activity/details/view");
    setSaving(false);
  };

  const photoBoxClass =
    "relative overflow-hidden rounded-xl bg-cover bg-center cursor-pointer group";

  return (
    <div className="page-shell">
      <ActivityDetailsStepBar />
      <div className="space-y-6">
        {/* Main Photo */}
        <div className="card">
          <h3
            className="mb-3 text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {copy.mainPhoto}
          </h3>
          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMain}
          />
          {mainPhotoDataUrl ? (
            <div
              className={photoBoxClass}
              style={{
                aspectRatio: "16/7",
                backgroundImage: `url(${mainPhotoDataUrl})`,
              }}
              onClick={() => mainInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Camera size={28} className="text-white" />
                <span className="ms-2 text-white text-sm font-medium">
                  {copy.changePhoto}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl transition hover:opacity-80"
              style={{
                height: 220,
                backgroundColor: "var(--bg-raised)",
                border: "2px dashed var(--border)",
              }}
            >
              <ImageIcon size={32} style={{ color: "var(--text-muted)" }} />
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {copy.uploadMain}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {copy.recommended}
              </p>
            </button>
          )}
          {error && <p className="input-error mt-2">{error}</p>}
        </div>

        {/* Gallery */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {copy.gallery} ({galleryDataUrls.length}/10)
            </h3>
            {galleryDataUrls.length < 10 && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  backgroundColor: "var(--brand-muted)",
                  color: "var(--brand)",
                }}
              >
                <Plus size={13} /> {copy.add}
              </button>
            )}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGallery}
          />
          <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
            {copy.hint}
          </p>
          {galleryDataUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryDataUrls.map((url, idx) => (
                <div
                  key={idx}
                  className={photoBoxClass}
                  style={{ aspectRatio: "4/3", backgroundImage: `url(${url})` }}
                >
                  <button
                    onClick={() => removeGallery(idx)}
                    className="absolute top-1 end-1 h-6 w-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate("/activity/details/policy")}
            className="btn btn-secondary rounded-2xl px-6 py-3 text-sm font-semibold"
          >
            {copy.back}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary px-8 py-3 text-sm font-semibold rounded-2xl"
            style={{
              backgroundColor: "var(--sidebar-active-text)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? copy.saving : copy.save}
          </button>
        </div>
      </div>
    </div>
  );
}
