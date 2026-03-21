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
} from "lucide-react";

const STORAGE_KEYS = [
  "hotel_details_main",
  "hotel_details_description",
  "hotel_details_icons",
  "hotel_details_policy",
  "hotel_details_photos",
];

function readSession() {
  return {
    main: JSON.parse(sessionStorage.getItem("hotel_details_main") || "null"),
    description: JSON.parse(
      sessionStorage.getItem("hotel_details_description") || "null",
    ),
    icons: JSON.parse(sessionStorage.getItem("hotel_details_icons") || "null"),
    policy: JSON.parse(
      sessionStorage.getItem("hotel_details_policy") || "null",
    ),
    photos: JSON.parse(
      sessionStorage.getItem("hotel_details_photos") || "null",
    ),
  };
}

/* ── Photo Slider ───────────────────────────────────────── */
function PhotoSlider({ photos }) {
  const [idx, setIdx] = useState(0);
  if (!photos?.length) return null;

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ aspectRatio: "21/8", backgroundColor: "#000" }}
    >
      <img
        src={photos[idx]}
        alt={`photo-${idx}`}
        className="w-full h-full object-cover"
        style={{ transition: "opacity .25s" }}
      />

      {/* bottom gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55))",
        }}
      />

      {/* counter badge */}
      <div className="absolute top-3 right-3 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
        {idx + 1} / {photos.length}
      </div>

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/65 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/65 transition-all"
          >
            <ChevronRight size={18} />
          </button>

          {/* pill dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 22 : 6,
                  height: 6,
                  backgroundColor:
                    i === idx ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-12 right-3 flex gap-1.5">
          {photos.slice(0, 5).map((url, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="rounded-lg overflow-hidden transition-all"
              style={{
                width: 44,
                height: 32,
                outline:
                  i === idx
                    ? "2px solid #fff"
                    : "2px solid rgba(255,255,255,0)",
                opacity: i === idx ? 1 : 0.65,
              }}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── OpenStreetMap via Nominatim ────────────────────────── */
function OsmMap({ city, country, lat: savedLat, lng: savedLng }) {
  const [coords, setCoords] = useState(
    savedLat != null ? { lat: savedLat, lon: savedLng } : null,
  );
  const [status, setStatus] = useState(savedLat != null ? "ready" : "loading");

  useEffect(() => {
    /* If user already pinned an exact location, use it directly */
    if (savedLat != null) {
      setCoords({ lat: savedLat, lon: savedLng });
      setStatus("ready");
      return;
    }

    const q = [city, country].filter(Boolean).join(", ");
    if (!q) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
      { headers: { "Accept-Language": "en" } },
    )
      .then((r) => r.json())
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
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [city, country, savedLat, savedLng]);

  if (status === "loading") {
    return (
      <div
        className="w-full h-56 rounded-xl flex flex-col items-center justify-center gap-2"
        style={{ backgroundColor: "var(--bg-raised)" }}
      >
        <div
          className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--sidebar-active-text)",
            borderTopColor: "transparent",
          }}
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Loading map…
        </p>
      </div>
    );
  }

  if (status === "error" || !coords) {
    return (
      <div
        className="w-full h-56 rounded-xl flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--bg-raised)" }}
      >
        <MapPin size={18} style={{ color: "var(--text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Map unavailable
        </p>
      </div>
    );
  }

  const { lat, lon } = coords;
  const d = 0.045;
  const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <iframe
      title="Hotel Location"
      src={src}
      loading="lazy"
      className="w-full h-56 rounded-xl"
      style={{ border: "1px solid var(--border)" }}
    />
  );
}

/* ── Section Card ────────────────────────────────────────── */
function SectionCard({ title, icon, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
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

/* ── Main Component ──────────────────────────────────────── */
export default function HotelDetailsView() {
  const navigate = useNavigate();
  const { main, description, icons, policy, photos } = readSession();

  const handleEdit = () => navigate("/hotel/details/main");
  const handleDelete = () => {
    if (
      !window.confirm(
        "This will delete all hotel details and restart the wizard. Continue?",
      )
    )
      return;
    STORAGE_KEYS.forEach((k) => sessionStorage.removeItem(k));
    navigate("/hotel/details/main");
  };

  /* ── empty state ── */
  if (!main) {
    return (
      <div className="page-shell flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--bg-raised)" }}
        >
          <Building2 size={36} style={{ color: "var(--text-muted)" }} />
        </div>
        <div className="text-center">
          <p
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No hotel details yet
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Complete the setup wizard to see your hotel profile here.
          </p>
        </div>
        <button
          onClick={() => navigate("/hotel/details/main")}
          className="btn btn-primary px-8 py-3 rounded-2xl text-sm font-semibold"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          Start Adding Details
        </button>
      </div>
    );
  }

  const stars = main.stars || 0;
  const selectedIconIds = new Set(icons?.selectedIcons || []);
  const allIcons = icons?.allIcons || [];
  const selectedIconObjs = allIcons.filter((ic) => selectedIconIds.has(ic.id));

  const allPhotos = [
    ...(photos?.mainPhotoDataUrl ? [photos.mainPhotoDataUrl] : []),
    ...(photos?.galleryDataUrls || []),
  ];

  return (
    <div className="page-shell space-y-5">
      {/* ── 1. Photo Slider ── */}
      {allPhotos.length > 0 && <PhotoSlider photos={allPhotos} />}

      {/* ── 2. Hotel Identity Card ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div
            className="h-[72px] w-[72px] flex-shrink-0 rounded-2xl overflow-hidden"
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
              <div className="h-full w-full flex items-center justify-center">
                <Building2 size={26} style={{ color: "var(--text-muted)" }} />
              </div>
            )}
          </div>

          {/* Text info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1
                  className="text-xl font-extrabold leading-tight truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {main.nameEn || "—"}
                </h1>
                {main.nameAr && (
                  <p
                    className="text-sm mt-0.5 font-medium"
                    dir="rtl"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {main.nameAr}
                  </p>
                )}
              </div>

              {/* Edit / Delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--sidebar-active-text)",
                    color: "#fff",
                  }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    color: "var(--danger)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            {/* Stars */}
            {stars > 0 && (
              <div className="flex items-center gap-0.5 mt-2">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" stroke="#f59e0b" />
                ))}
                <span
                  className="ml-1.5 text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stars}-Star
                </span>
              </div>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {main.category && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(29,78,216,0.1)",
                    color: "var(--sidebar-active-text)",
                  }}
                >
                  {main.category}
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

      {/* ── 3. Description + Amenities ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Description" icon="📝" className="lg:col-span-2">
          {description?.descriptionEn ? (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {description.descriptionEn}
            </p>
          ) : (
            <p
              className="text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              No description added.
            </p>
          )}
          {description?.descriptionAr && (
            <p
              className="text-sm leading-relaxed mt-3 pt-3"
              dir="rtl"
              style={{
                color: "var(--text-secondary)",
                borderTop: "1px solid var(--border)",
              }}
            >
              {description.descriptionAr}
            </p>
          )}
        </SectionCard>

        <SectionCard title="Amenities" icon="🏷️">
          {selectedIconObjs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedIconObjs.map((ic) => (
                <span
                  key={ic.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(29,78,216,0.08)",
                    color: "var(--sidebar-active-text)",
                    border: "1px solid rgba(29,78,216,0.15)",
                  }}
                >
                  {ic.emoji} {ic.label}
                </span>
              ))}
            </div>
          ) : (
            <p
              className="text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              No amenities added.
            </p>
          )}
        </SectionCard>
      </div>

      {/* ── 4. Map + Policy ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Location on Map" icon="📍">
          {(main.city || main.country) && (
            <p
              className="text-xs mb-3 font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <MapPin
                size={11}
                className="inline mr-1"
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
          />
          <a
            href={`https://www.openstreetmap.org/search?query=${encodeURIComponent([main.city, main.country].filter(Boolean).join(", "))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs inline-flex items-center gap-1 hover:underline"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            Open in OpenStreetMap ↗
          </a>
        </SectionCard>

        <SectionCard title="Hotel Policy" icon="🛡️">
          {policy?.policyEn ? (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {policy.policyEn}
            </p>
          ) : (
            <p
              className="text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              No policy added.
            </p>
          )}
          {policy?.policyAr && (
            <p
              className="text-sm leading-relaxed mt-3 pt-3"
              dir="rtl"
              style={{
                color: "var(--text-secondary)",
                borderTop: "1px solid var(--border)",
              }}
            >
              {policy.policyAr}
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
