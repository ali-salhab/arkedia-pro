import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Building2,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Tag,
  ShieldCheck,
  Upload,
  Check,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  useGetIconsQuery,
  useGetHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  useUploadImageMutation,
} from "../../store/services/api";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import {
  HOTEL_STORAGE_KEYS,
  buildHotelDraftFromRecord,
  buildHotelPayload,
  buildPolicyText,
  getStoredHotelId,
  persistHotelDraftToSession,
  readHotelDraftFromSession,
  setStoredHotelId,
} from "./draftUtils";

const STORAGE_KEYS = [
  HOTEL_STORAGE_KEYS.main,
  HOTEL_STORAGE_KEYS.description,
  HOTEL_STORAGE_KEYS.icons,
  HOTEL_STORAGE_KEYS.policy,
  HOTEL_STORAGE_KEYS.photos,
];

const COPY = {
  en: {
    emptyTitle: "No hotel details yet",
    emptySubtitle: "Complete the setup wizard to see your hotel profile here.",
    start: "Start Adding Details",
    deleteConfirm:
      "This will delete all hotel details and restart the wizard. Continue?",
    edit: "Edit",
    delete: "Delete",
    starSuffix: "Star",
    sectionDescription: "Description",
    sectionAmenities: "Amenities",
    sectionLocation: "Location on Map",
    sectionPolicy: "Hotel Policy",
    noDescription: "No description added.",
    noAmenities: "No amenities added.",
    noPolicy: "No policy added.",
    mapLoading: "Loading map...",
    mapUnavailable: "Map unavailable",
    openMap: "Open in OpenStreetMap",
    pendingRequested: "Pending icon requests",
    awaitingDesign: "Awaiting Design",
    uploadingDetails: "Uploading hotel details...",
    loadingSavedDetails: "Loading saved hotel details...",
    uploadingCover: "Uploading cover photo...",
    uploadingLogo: "Uploading hotel logo...",
    uploadingGallery: "Uploading gallery photos...",
    savingDatabase: "Saving hotel to database...",
    publishing: "Publishing...",
  },
  ar: {
    emptyTitle: "لا توجد بيانات للفندق بعد",
    emptySubtitle: "أكمل خطوات الإعداد حتى تظهر معاينة الفندق هنا.",
    start: "ابدأ بإضافة التفاصيل",
    deleteConfirm:
      "سيؤدي هذا إلى حذف كل بيانات الفندق وإعادة بدء الخطوات. هل تريد المتابعة؟",
    edit: "تعديل",
    delete: "حذف",
    starSuffix: "نجوم",
    sectionDescription: "الوصف",
    sectionAmenities: "المرافق",
    sectionLocation: "الموقع على الخريطة",
    sectionPolicy: "سياسة الفندق",
    noDescription: "لم تتم إضافة وصف بعد.",
    noAmenities: "لم تتم إضافة مرافق بعد.",
    noPolicy: "لم تتم إضافة سياسة بعد.",
    mapLoading: "جارٍ تحميل الخريطة...",
    mapUnavailable: "الخريطة غير متاحة",
    openMap: "فتح في OpenStreetMap",
    pendingRequested: "طلبات الأيقونات المعلقة",
    awaitingDesign: "بانتظار التصميم",
    uploadingDetails: "جارٍ رفع تفاصيل الفندق...",
    loadingSavedDetails: "جارٍ تحميل بيانات الفندق المحفوظة...",
    uploadingCover: "جارٍ رفع الصورة الرئيسية...",
    uploadingLogo: "جارٍ رفع شعار الفندق...",
    uploadingGallery: "جارٍ رفع صور المعرض...",
    savingDatabase: "جارٍ حفظ الفندق في قاعدة البيانات...",
    publishing: "جارٍ النشر...",
  },
};

const CATEGORY_LABELS = {
  Hotel: { en: "Hotel", ar: "فندق" },
  Resort: { en: "Resort", ar: "منتجع" },
  Boutique: { en: "Boutique", ar: "بوتيك" },
  Hostel: { en: "Hostel", ar: "نزل" },
  Motel: { en: "Motel", ar: "موتيل" },
  Villa: { en: "Villa", ar: "فيلا" },
};

function PhotoSlider({ photos }) {
  const [index, setIndex] = useState(0);

  if (!photos?.length) return null;

  const prev = () =>
    setIndex((value) => (value - 1 + photos.length) % photos.length);
  const next = () => setIndex((value) => (value + 1) % photos.length);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16 / 9", backgroundColor: "#000" }}
    >
      <img
        src={photos[index]}
        alt={`photo-${index + 1}`}
        className="h-full w-full object-cover"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55))",
        }}
      />

      <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        {index + 1} / {photos.length}
      </div>

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/65"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/65"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {photos.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => setIndex(dotIndex)}
                className="rounded-full transition-all"
                style={{
                  width: dotIndex === index ? 22 : 6,
                  height: 6,
                  backgroundColor:
                    dotIndex === index ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OsmMap({ city, country, lat: savedLat, lng: savedLng, copy }) {
  const [coords, setCoords] = useState(
    savedLat != null ? { lat: savedLat, lon: savedLng } : null,
  );
  const [status, setStatus] = useState(savedLat != null ? "ready" : "loading");

  useEffect(() => {
    if (savedLat != null) {
      setCoords({ lat: savedLat, lon: savedLng });
      setStatus("ready");
      return;
    }

    const query = [city, country].filter(Boolean).join(", ");
    if (!query) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (data[0]) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [city, country, savedLat, savedLng]);

  if (status === "loading") {
    return (
      <div
        className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl"
        style={{ backgroundColor: "var(--bg-raised)" }}
      >
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "var(--sidebar-active-text)",
            borderTopColor: "transparent",
          }}
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {copy.mapLoading}
        </p>
      </div>
    );
  }

  if (status === "error" || !coords) {
    return (
      <div
        className="flex h-56 w-full items-center justify-center gap-2 rounded-xl"
        style={{ backgroundColor: "var(--bg-raised)" }}
      >
        <MapPin size={18} style={{ color: "var(--text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {copy.mapUnavailable}
        </p>
      </div>
    );
  }

  const { lat, lon } = coords;
  const delta = 0.045;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <iframe
      title="Hotel Location"
      src={src}
      loading="lazy"
      className="h-56 w-full rounded-xl"
      style={{ border: "1px solid var(--border)" }}
    />
  );
}

function SectionCard({ title, Icon, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <Icon
            size={14}
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          />
        )}
        <h3
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function AmenityChip({ icon, label }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium"
      style={{
        backgroundColor: "rgba(29,78,216,0.08)",
        color: "var(--sidebar-active-text)",
        border: "1px solid rgba(29,78,216,0.15)",
      }}
    >
      {icon?.imageUrl ? (
        <img
          src={icon.imageUrl}
          alt={label}
          className="h-4 w-4 rounded object-contain"
        />
      ) : (
        <ImageIcon size={14} />
      )}
      {label}
    </span>
  );
}

export default function HotelDetailsView() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const { data: hotels = [], isLoading: loadingHotels } = useGetHotelsQuery();
  const { data: allIcons = [] } = useGetIconsQuery();
  const sessionDraft = readHotelDraftFromSession();
  const persistedHotel = hotels[0] || null;
  const persistedDraft = persistedHotel
    ? buildHotelDraftFromRecord(persistedHotel)
    : null;
  const { main, description, icons, policy, photos } = sessionDraft.main
    ? sessionDraft
    : persistedDraft || sessionDraft;

  const [createHotel] = useCreateHotelMutation();
  const [updateHotel] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();
  const [uploadImage] = useUploadImageMutation();
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishStage, setPublishStage] = useState("");
  const [publishedId, setPublishedId] = useState(() => getStoredHotelId());

  useEffect(() => {
    if (!persistedHotel?._id) return;

    if (!publishedId) {
      setPublishedId(persistedHotel._id);
      setStoredHotelId(persistedHotel._id);
    }

    if (!sessionDraft.main && persistedDraft) {
      persistHotelDraftToSession(persistedDraft);
    }
  }, [persistedHotel, persistedDraft, publishedId, sessionDraft.main]);

  const handlePublish = async () => {
    if (!main) return;

    setPublishing(true);
    setPublishError("");
    setPublishStage(copy.uploadingDetails);

    try {
      let thumbnailUrl = photos?.mainPhotoDataUrl || "";
      if (thumbnailUrl?.startsWith("data:")) {
        setPublishStage(copy.uploadingCover);
        const result = await uploadImage({
          data: thumbnailUrl,
          folder: "hotels",
        }).unwrap();
        thumbnailUrl = result.url;
      }

      let logoUrl = main.logoDataUrl || "";
      if (logoUrl?.startsWith("data:")) {
        setPublishStage(copy.uploadingLogo);
        const result = await uploadImage({
          data: logoUrl,
          folder: "hotels/logos",
        }).unwrap();
        logoUrl = result.url;
      }

      const rawGallery = photos?.galleryDataUrls || [];
      let gallery = rawGallery;

      if (rawGallery.some((src) => src?.startsWith("data:"))) {
        setPublishStage(copy.uploadingGallery);
        gallery = await Promise.all(
          rawGallery.map(async (src) => {
            if (src?.startsWith("data:")) {
              const result = await uploadImage({
                data: src,
                folder: "hotels/gallery",
              }).unwrap();
              return result.url;
            }

            return src;
          }),
        );
      }

      setPublishStage(copy.savingDatabase);
      const body = buildHotelPayload({
        main: {
          ...main,
          logoDataUrl: logoUrl,
        },
        description,
        icons,
        policy,
        photos: {
          mainPhotoDataUrl: thumbnailUrl,
          galleryDataUrls: gallery,
        },
      });

      let result;
      if (publishedId) {
        result = await updateHotel({ _id: publishedId, ...body }).unwrap();
      } else {
        result = await createHotel(body).unwrap();
      }

      if (result?._id) {
        setPublishedId(result._id);
        setStoredHotelId(result._id);
        persistHotelDraftToSession(buildHotelDraftFromRecord(result));
      }
    } catch (err) {
      setPublishError(
        err?.data?.message ||
          (lang === "ar"
            ? "فشل الحفظ. تحقق من الاتصال."
            : "Publish failed. Check your connection."),
      );
    } finally {
      setPublishStage("");
      setPublishing(false);
    }
  };

  const handleEdit = () => navigate("/hotel/details/main");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDelete = () => setShowDeleteModal(true);
  const confirmDelete = () => {
    if (publishedId) deleteHotel(publishedId).catch(() => {});
    STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    sessionStorage.removeItem(HOTEL_STORAGE_KEYS.savedId);
    navigate("/hotel/details/main");
  };

  if (!main && loadingHotels) {
    return (
      <div className="page-shell flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: "var(--sidebar-active-text)" }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {copy.loadingSavedDetails}
        </p>
      </div>
    );
  }

  if (!main) {
    return (
      <div className="page-shell flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--bg-raised)" }}
        >
          <Building2 size={36} style={{ color: "var(--text-muted)" }} />
        </div>
        <div className="text-center">
          <p
            className="mb-2 text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {copy.emptyTitle}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {copy.emptySubtitle}
          </p>
        </div>
        <button
          onClick={() => navigate("/hotel/details/main")}
          className="btn btn-primary rounded-2xl px-8 py-3 text-sm font-semibold"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {copy.start}
        </button>
      </div>
    );
  }

  const stars = main.stars || 0;
  const selectedIds = new Set((icons?.selectedIcons || []).map(String));
  const selectedIconObjs = allIcons.filter((icon) =>
    selectedIds.has(String(icon._id)),
  );
  const pendingRequested = icons?.requestedItems || [];
  const allPhotos = [
    ...(photos?.mainPhotoDataUrl ? [photos.mainPhotoDataUrl] : []),
    ...(photos?.galleryDataUrls || []),
  ];

  const primaryName =
    lang === "ar" && main.nameAr
      ? main.nameAr
      : main.nameEn || main.nameAr || "—";
  const secondaryName = lang === "ar" ? main.nameEn : main.nameAr;
  const primaryDescription =
    lang === "ar" && description?.descriptionAr
      ? description.descriptionAr
      : description?.descriptionEn;
  const secondaryDescription =
    lang === "ar" ? description?.descriptionEn : description?.descriptionAr;
  const primaryPolicy = buildPolicyText(policy, lang);
  const secondaryPolicyRaw = buildPolicyText(
    policy,
    lang === "ar" ? "en" : "ar",
  );
  const secondaryPolicy =
    secondaryPolicyRaw && secondaryPolicyRaw !== primaryPolicy
      ? secondaryPolicyRaw
      : "";
  const localizedCategory = main.category
    ? CATEGORY_LABELS[main.category]?.[lang] || main.category
    : "";

  return (
    <div className="page-shell space-y-5">
      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        message={copy.deleteConfirm}
      />
      {publishing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            backgroundColor: "rgba(15,23,42,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              minWidth: 250,
              maxWidth: "90vw",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.9rem",
              padding: "0.75rem 0.9rem",
              boxShadow: "0 10px 28px rgba(15,23,42,0.14)",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "999px",
                border: "2px solid #173f78",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {publishStage || copy.uploadingDetails}
            </span>
          </div>
        </div>
      )}
      {allPhotos.length > 0 && <PhotoSlider photos={allPhotos} />}

      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl"
            style={{
              backgroundColor: "var(--bg-raised)",
              border: "2px solid var(--border)",
            }}
          >
            {main.logoDataUrl ? (
              <img
                src={main.logoDataUrl}
                alt="logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 size={26} style={{ color: "var(--text-muted)" }} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1
                  className="truncate text-xl font-extrabold leading-tight"
                  style={{ color: "var(--text-primary)" }}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  {primaryName}
                </h1>
                {secondaryName && (
                  <p
                    className="mt-0.5 text-sm font-medium"
                    dir={lang === "ar" ? "ltr" : "rtl"}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {secondaryName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold"
                  style={{
                    backgroundColor: publishedId ? "#059669" : "#173f78",
                    color: "#fff",
                    opacity: publishing ? 0.7 : 1,
                    cursor: publishing ? "not-allowed" : "pointer",
                  }}
                >
                  {publishing ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      {copy.publishing}
                    </>
                  ) : publishedId ? (
                    <><Check size={13} /> {lang === "ar" ? "تحديث الفندق" : "Update Hotel"}</>
                  ) : (
                    <><Upload size={13} /> {lang === "ar" ? "نشر الفندق" : "Publish Hotel"}</>
                  )}
                </button>
                <button
                  onClick={handleEdit}
                  className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--sidebar-active-text)",
                    color: "#fff",
                  }}
                >
                  <Edit3 size={13} />
                  {copy.edit}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    color: "var(--danger)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Trash2 size={13} />
                  {copy.delete}
                </button>
              </div>
            </div>

            {publishError && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.5rem" }}>{publishError}</p>
            )}

            {stars > 0 && (
              <div className="mt-2 flex items-center gap-0.5">
                {Array.from({ length: stars }).map((_, index) => (
                  <Star key={index} size={15} fill="#f59e0b" stroke="#f59e0b" />
                ))}
                <span
                  className="ml-1.5 text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stars} {copy.starSuffix}
                </span>
              </div>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {localizedCategory && (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: "rgba(29,78,216,0.1)",
                    color: "var(--sidebar-active-text)",
                  }}
                >
                  {localizedCategory}
                </span>
              )}
              {(main.city || main.country) && (
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <MapPin size={11} />
                  {[main.city, main.country].filter(Boolean).join(", ")}
                </span>
              )}
              {main.location && (
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {main.location}
                  {main.postCode ? ` · ${main.postCode}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard
          title={copy.sectionDescription}
          Icon={FileText}
          className="lg:col-span-2"
        >
          {primaryDescription ? (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-primary)" }}
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {primaryDescription}
            </p>
          ) : (
            <p
              className="text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              {copy.noDescription}
            </p>
          )}

          {secondaryDescription && (
            <p
              className="mt-3 border-t pt-3 text-sm leading-relaxed"
              dir={lang === "ar" ? "ltr" : "rtl"}
              style={{
                color: "var(--text-secondary)",
                borderTop: "1px solid var(--border)",
              }}
            >
              {secondaryDescription}
            </p>
          )}
        </SectionCard>

        <SectionCard title={copy.sectionAmenities} Icon={Tag}>
          {selectedIconObjs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedIconObjs.map((icon) => (
                <AmenityChip
                  key={icon._id}
                  icon={icon}
                  label={
                    lang === "ar" && icon.labelAr ? icon.labelAr : icon.label
                  }
                />
              ))}
            </div>
          ) : (
            <p
              className="text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              {copy.noAmenities}
            </p>
          )}

          {pendingRequested.length > 0 && (
            <div
              className="mt-4 border-t pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p
                className="mb-2 text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {copy.pendingRequested}
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingRequested.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium"
                    style={{
                      backgroundColor: "#fff7ed",
                      color: "#9a3412",
                      border: "1px dashed #fdba74",
                    }}
                  >
                    <ImageIcon size={14} />
                    {lang === "ar" && item.labelAr ? item.labelAr : item.label}
                    <span className="text-[10px]">{copy.awaitingDesign}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title={copy.sectionLocation} Icon={MapPin}>
          {(main.city || main.country) && (
            <p
              className="mb-3 text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <MapPin
                size={11}
                className="mr-1 inline"
                style={{ color: "var(--sidebar-active-text)" }}
              />
              {[main.city, main.location, main.country]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <OsmMap
            city={main.city}
            country={main.country}
            lat={main.lat ?? null}
            lng={main.lng ?? null}
            copy={copy}
          />
          <a
            href={`https://www.openstreetmap.org/search?query=${encodeURIComponent([main.city, main.country].filter(Boolean).join(", "))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs hover:underline"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.openMap} ↗
          </a>
        </SectionCard>

        <SectionCard title={copy.sectionPolicy} Icon={ShieldCheck}>
          {primaryPolicy ? (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-primary)", whiteSpace: "pre-line" }}
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {primaryPolicy}
            </p>
          ) : (
            <p
              className="text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              {copy.noPolicy}
            </p>
          )}

          {secondaryPolicy && (
            <p
              className="mt-3 border-t pt-3 text-sm leading-relaxed"
              dir={lang === "ar" ? "ltr" : "rtl"}
              style={{
                color: "var(--text-secondary)",
                borderTop: "1px solid var(--border)",
                whiteSpace: "pre-line",
              }}
            >
              {secondaryPolicy}
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
