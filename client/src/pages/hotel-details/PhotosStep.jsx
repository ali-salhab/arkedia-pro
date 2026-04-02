import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Plus, X, Camera } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";
import {
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useUploadImageMutation,
} from "../../store/services/api";
import {
  buildHotelDraftFromRecord,
  buildHotelPayload,
  getStoredHotelId,
  persistHotelDraftToSession,
  readHotelDraftFromSession,
  setStoredHotelId,
} from "./draftUtils";

const COPY = {
  en: {
    mainPhoto: "Main Photo",
    gallery: "Photo Gallery",
    changePhoto: "Change photo",
    uploadMain: "Click to upload main photo",
    recommended: "Recommended: 1920 x 1080 px",
    add: "Add",
    hint: "Add up to 10 photos showcasing your property, rooms, lobby, and facilities.",
    save: "Save & View Details",
    saving: "Saving...",
    errorMain: "Please upload a main photo before saving",
    errorSave: "Failed to save hotel details. Please try again.",
  },
  ar: {
    mainPhoto: "الصورة الرئيسية",
    gallery: "معرض الصور",
    changePhoto: "تغيير الصورة",
    uploadMain: "اضغط لرفع الصورة الرئيسية",
    recommended: "المقاس المقترح: 1920 × 1080",
    add: "إضافة",
    hint: "أضف حتى 10 صور توضح الفندق والغرف واللوبي والمرافق.",
    save: "حفظ وعرض التفاصيل",
    saving: "جارٍ الحفظ...",
    errorMain: "يرجى رفع الصورة الرئيسية قبل الحفظ",
    errorSave: "تعذر حفظ تفاصيل الفندق. حاول مرة أخرى.",
  },
};

function readAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.readAsDataURL(file);
  });
}

export default function HotelPhotosStep() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [createHotel] = useCreateHotelMutation();
  const [updateHotel] = useUpdateHotelMutation();
  const [uploadImage] = useUploadImageMutation();

  useEffect(() => {
    if (!sessionStorage.getItem("hotel_details_policy")) {
      navigate("/hotel/details/policy", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleMainPhoto = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataURL(file);
    setMainPhoto({ dataUrl });
    setError("");
    event.target.value = "";
  }, []);

  const handleGalleryAdd = useCallback(
    async (event) => {
      const files = Array.from(event.target.files || []);
      const remaining = 10 - gallery.length;
      const nextFiles = files.slice(0, remaining);
      const nextItems = await Promise.all(
        nextFiles.map(async (file) => ({ dataUrl: await readAsDataURL(file) })),
      );
      setGallery((prev) => [...prev, ...nextItems]);
      event.target.value = "";
    },
    [gallery.length],
  );

  const removeGallery = (index) =>
    setGallery((prev) => prev.filter((_, itemIndex) => itemIndex !== index));

  const handleSave = async () => {
    if (!mainPhoto) {
      setError(copy.errorMain);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const photosDraft = {
        mainPhotoDataUrl: mainPhoto.dataUrl,
        galleryDataUrls: gallery.map((item) => item.dataUrl),
      };

      persistHotelDraftToSession({ photos: photosDraft });

      const draft = readHotelDraftFromSession();

      let thumbnailUrl = photosDraft.mainPhotoDataUrl || "";
      if (thumbnailUrl?.startsWith("data:")) {
        const result = await uploadImage({
          data: thumbnailUrl,
          folder: "hotels",
        }).unwrap();
        thumbnailUrl = result.url;
      }

      let logoUrl = draft.main?.logoDataUrl || "";
      if (logoUrl?.startsWith("data:")) {
        const result = await uploadImage({
          data: logoUrl,
          folder: "hotels/logos",
        }).unwrap();
        logoUrl = result.url;
      }

      const galleryUrls = await Promise.all(
        photosDraft.galleryDataUrls.map(async (source) => {
          if (source?.startsWith("data:")) {
            const result = await uploadImage({
              data: source,
              folder: "hotels/gallery",
            }).unwrap();
            return result.url;
          }

          return source;
        }),
      );

      const body = buildHotelPayload({
        ...draft,
        main: {
          ...draft.main,
          logoDataUrl: logoUrl,
        },
        photos: {
          mainPhotoDataUrl: thumbnailUrl,
          galleryDataUrls: galleryUrls,
        },
      });

      const currentId = getStoredHotelId();
      let savedHotel;

      if (currentId) {
        savedHotel = await updateHotel({ _id: currentId, ...body }).unwrap();
      } else {
        savedHotel = await createHotel(body).unwrap();
      }

      if (savedHotel?._id) {
        setStoredHotelId(savedHotel._id);
        persistHotelDraftToSession(buildHotelDraftFromRecord(savedHotel));
      }

      navigate("/hotel/details/view");
    } catch {
      setError(copy.errorSave);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2
            className="mb-3 text-lg font-bold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.mainPhoto}
          </h2>

          <button
            onClick={() => mainInputRef.current?.click()}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl transition-all"
            style={{
              minHeight: 240,
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
                  className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                >
                  <Camera size={32} className="mb-1 text-white" />
                  <span className="text-sm font-medium text-white">
                    {copy.changePhoto}
                  </span>
                </div>
              </>
            ) : (
              <div
                className="flex flex-col items-center gap-3"
                style={{ color: "var(--text-muted)" }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  <ImageIcon size={28} strokeWidth={1.5} />
                </div>
                <p className="text-center text-sm font-medium">
                  {copy.uploadMain}
                </p>
                <p className="text-xs">{copy.recommended}</p>
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

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              {copy.gallery}
            </h2>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {gallery.length} / 10
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((item, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-xl"
                style={{ border: "1px solid var(--border)" }}
              >
                <img
                  src={item.dataUrl}
                  alt={`gallery-${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/30" />
                <button
                  onClick={() => removeGallery(index)}
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: "var(--danger)" }}
                >
                  <X size={10} className="text-white" strokeWidth={3} />
                </button>
                <div
                  className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  {index + 1}
                </div>
              </div>
            ))}

            {gallery.length < 10 && (
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl transition-all"
                style={{
                  backgroundColor: "var(--bg-raised)",
                  border: "2px dashed var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                <Plus size={20} />
                <span className="text-xs">{copy.add}</span>
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
            {copy.hint}
          </p>
        </div>
      </div>

      {error && <p className="input-error mt-4">{error}</p>}

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full rounded-2xl py-3 text-base"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {saving ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  );
}
