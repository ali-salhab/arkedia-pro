import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  UtensilsCrossed,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const STORAGE_KEYS = [
  "restaurant_details_main",
  "restaurant_details_description",
  "restaurant_details_policy",
  "restaurant_details_photos",
];

const COPY = {
  en: {
    emptyTitle: "No restaurant details yet",
    emptySubtitle:
      "Complete the setup wizard to see your restaurant profile here.",
    start: "Start Adding Details",
    deleteConfirm:
      "This will delete all restaurant details and restart the wizard. Continue?",
    edit: "Edit",
    delete: "Delete",
    starSuffix: "Star",
    sectionDescription: "Description",
    sectionPolicy: "Restaurant Policy",
    noDescription: "No description added.",
    noPolicy: "No policy added.",
  },
  ar: {
    emptyTitle: "لا توجد بيانات للمطعم بعد",
    emptySubtitle: "أكمل خطوات الإعداد حتى تظهر معاينة المطعم هنا.",
    start: "ابدأ بإضافة التفاصيل",
    deleteConfirm:
      "سيؤدي هذا إلى حذف كل بيانات المطعم وإعادة بدء الخطوات. هل تريد المتابعة؟",
    edit: "تعديل",
    delete: "حذف",
    starSuffix: "نجوم",
    sectionDescription: "الوصف",
    sectionPolicy: "سياسة المطعم",
    noDescription: "لم تتم إضافة وصف بعد.",
    noPolicy: "لم تتم إضافة سياسة بعد.",
  },
};

const CATEGORY_LABELS = {
  Restaurant: { en: "Restaurant", ar: "مطعم" },
  Cafe: { en: "Cafe", ar: "كافيه" },
  "Fast Food": { en: "Fast Food", ar: "وجبات سريعة" },
  "Fine Dining": { en: "Fine Dining", ar: "مطعم فاخر" },
  Buffet: { en: "Buffet", ar: "بوفيه" },
  Bakery: { en: "Bakery", ar: "مخبز" },
};

function readSession() {
  return {
    main: JSON.parse(
      sessionStorage.getItem("restaurant_details_main") || "null",
    ),
    description: JSON.parse(
      sessionStorage.getItem("restaurant_details_description") || "null",
    ),
    policy: JSON.parse(
      sessionStorage.getItem("restaurant_details_policy") || "null",
    ),
    photos: JSON.parse(
      sessionStorage.getItem("restaurant_details_photos") || "null",
    ),
  };
}

function PhotoSlider({ photos }) {
  const [index, setIndex] = useState(0);
  if (!photos?.length) return null;
  const prev = () => setIndex((v) => (v - 1 + photos.length) % photos.length);
  const next = () => setIndex((v) => (v + 1) % photos.length);
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16/9", backgroundColor: "#000" }}
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

function SectionCard({ title, icon, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base leading-none">{icon}</span>
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

function PolicyRow({ label, value }) {
  if (!value) return null;
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        backgroundColor: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      <span
        className="mt-0.5 text-xs font-semibold w-28 flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function RestaurantDetailsView() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const { main, description, policy, photos } = readSession();

  const handleEdit = () => navigate("/restaurant/details/main");
  const handleDelete = () => {
    if (!window.confirm(copy.deleteConfirm)) return;
    STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    navigate("/restaurant/details/main");
  };

  if (!main) {
    return (
      <div className="page-shell flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--bg-raised)" }}
        >
          <UtensilsCrossed size={36} style={{ color: "var(--text-muted)" }} />
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
          onClick={() => navigate("/restaurant/details/main")}
          className="btn btn-primary rounded-2xl px-8 py-3 text-sm font-semibold"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {copy.start}
        </button>
      </div>
    );
  }

  const stars = main.stars || 0;
  const allPhotos = [
    ...(photos?.mainPhotoDataUrl ? [photos.mainPhotoDataUrl] : []),
    ...(photos?.galleryDataUrls || []),
  ];
  const primaryName =
    lang === "ar" && main.nameAr
      ? main.nameAr
      : main.nameEn || main.nameAr || "—";
  const secondaryName = lang === "ar" ? main.nameEn : main.nameAr;
  const primaryDesc =
    lang === "ar" && description?.descriptionAr
      ? description.descriptionAr
      : description?.descriptionEn;
  const secondaryDesc =
    lang === "ar" ? description?.descriptionEn : description?.descriptionAr;
  const localizedCategory = main.category
    ? CATEGORY_LABELS[main.category]?.[lang] || main.category
    : "";

  // Policy display labels
  const policyLabels = {
    en: {
      openingHours: "Opening Hours",
      closingHours: "Closing Hours",
      reservation: "Reservation",
      smoking: "Smoking",
      dresscode: "Dress Code",
    },
    ar: {
      openingHours: "ساعات الفتح",
      closingHours: "ساعات الإغلاق",
      reservation: "الحجز",
      smoking: "التدخين",
      dresscode: "كود اللباس",
    },
  };
  const pl = policyLabels[lang] || policyLabels.en;

  return (
    <div className="page-shell space-y-5">
      {allPhotos.length > 0 && <PhotoSlider photos={allPhotos} />}

      {/* Header card */}
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
              <UtensilsCrossed
                size={26}
                style={{ color: "var(--text-muted)" }}
              />
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
                  onClick={handleEdit}
                  className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--sidebar-active-text)",
                    color: "#fff",
                  }}
                >
                  <Edit3 size={13} /> {copy.edit}
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
                  <Trash2 size={13} /> {copy.delete}
                </button>
              </div>
            </div>

            {stars > 0 && (
              <div className="mt-2 flex items-center gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" stroke="#f59e0b" />
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
              {main.cuisine && (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: "rgba(234,179,8,0.12)",
                    color: "#a16207",
                  }}
                >
                  🍴 {main.cuisine}
                </span>
              )}
              {(main.city || main.country) && (
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <MapPin size={11} />{" "}
                  {[main.city, main.country].filter(Boolean).join(", ")}
                </span>
              )}
              {main.location && (
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {main.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <SectionCard title={copy.sectionDescription} icon="📝">
        {primaryDesc ? (
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-primary)" }}
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {primaryDesc}
          </p>
        ) : (
          <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            {copy.noDescription}
          </p>
        )}
        {secondaryDesc && (
          <p
            className="mt-3 border-t pt-3 text-sm leading-relaxed"
            dir={lang === "ar" ? "ltr" : "rtl"}
            style={{
              color: "var(--text-secondary)",
              borderTop: "1px solid var(--border)",
            }}
          >
            {secondaryDesc}
          </p>
        )}
      </SectionCard>

      {/* Policy */}
      <SectionCard title={copy.sectionPolicy} icon="🛡️">
        {policy ? (
          <div className="flex flex-col gap-2">
            <PolicyRow label={pl.openingHours} value={policy.openingHours} />
            <PolicyRow label={pl.closingHours} value={policy.closingHours} />
            <PolicyRow
              label={pl.reservation}
              value={policy.reservationPolicy}
            />
            <PolicyRow label={pl.smoking} value={policy.smokingPolicy} />
            <PolicyRow label={pl.dresscode} value={policy.dressCode} />
            {policy.policyNotes && (
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                {policy.policyNotes}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            {copy.noPolicy}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
