import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Plus, X, Camera } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";

function readAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

export default function HotelPhotosStep() {
  const navigate = useNavigate();
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [mainPhoto, setMainPhoto] = useState(() => {
    const saved = JSON.parse(
      sessionStorage.getItem("hotel_details_photos") || "null",
    );
    return saved?.mainPhotoDataUrl ? { dataUrl: saved.mainPhotoDataUrl } : null;
  });
  const [gallery, setGallery] = useState(() => {
    const saved = JSON.parse(
      sessionStorage.getItem("hotel_details_photos") || "null",
    );
    return (saved?.galleryDataUrls || []).map((url) => ({ dataUrl: url }));
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleMainPhoto = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataURL(file);
    setMainPhoto({ dataUrl });
    setError("");
    e.target.value = "";
  }, []);

  const handleGalleryAdd = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      const remaining = 10 - gallery.length;
      const toAdd = files.slice(0, remaining);
      const newEntries = await Promise.all(
        toAdd.map(async (f) => ({ dataUrl: await readAsDataURL(f) })),
      );
      setGallery((prev) => [...prev, ...newEntries]);
      e.target.value = "";
    },
    [gallery.length],
  );

  const removeGallery = (idx) =>
    setGallery((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!mainPhoto) {
      setError("Please upload a main photo before saving");
      return;
    }
    setSaving(true);
    try {
      sessionStorage.setItem(
        "hotel_details_photos",
        JSON.stringify({
          mainPhotoDataUrl: mainPhoto.dataUrl,
          galleryDataUrls: gallery.map((g) => g.dataUrl),
        }),
      );
      navigate("/hotel/details/view");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main photo – left col */}
        <div>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Main Photo
          </h2>
          <button
            onClick={() => mainInputRef.current?.click()}
            className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center transition-all group"
            style={{
              height: 280,
              backgroundColor: "var(--bg-raised)",
              border: `2px dashed ${mainPhoto ? "transparent" : "var(--border)"}`,
            }}
          >
            {mainPhoto ? (
              <>
                <img
                  src={mainPhoto.dataUrl}
                  alt="main"
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                >
                  <Camera size={32} className="text-white mb-1" />
                  <span className="text-white text-sm font-medium">
                    Change photo
                  </span>
                </div>
              </>
            ) : (
              <div
                className="flex flex-col items-center gap-3"
                style={{ color: "var(--text-muted)" }}
              >
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  <ImageIcon size={28} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium">
                  Click to upload main photo
                </p>
                <p className="text-xs">Recommended: 1920 × 1080 px</p>
              </div>
            )}
          </button>
          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMainPhoto}
          />
        </div>

        {/* Gallery – right col */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              Photo Gallery
            </h2>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {gallery.length} / 10
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {gallery.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden group"
                style={{ border: "1px solid var(--border)" }}
              >
                <img
                  src={item.dataUrl}
                  alt={`gallery-${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                <button
                  onClick={() => removeGallery(idx)}
                  className="absolute top-1.5 right-1.5 h-5 w-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "var(--danger)" }}
                >
                  <X size={10} className="text-white" strokeWidth={3} />
                </button>
                <div
                  className="absolute bottom-1.5 left-1.5 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  {idx + 1}
                </div>
              </div>
            ))}

            {gallery.length < 10 && (
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                style={{
                  backgroundColor: "var(--bg-raised)",
                  border: "2px dashed var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                <Plus size={20} />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryAdd}
          />

          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Add up to 10 photos showcasing your property — rooms, lobby,
            facilities.
          </p>
        </div>
      </div>

      {error && <p className="input-error mt-4">{error}</p>}

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full text-base py-3 rounded-2xl"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {saving ? "Saving…" : "Save & View Details"}
        </button>
      </div>
    </div>
  );
}
