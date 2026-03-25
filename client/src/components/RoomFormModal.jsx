import { useState, useEffect, useRef } from "react";
import {
  Wifi,
  AirVent,
  Tv,
  Wine,
  Lock,
  Sunset,
  Bath,
  UtensilsCrossed,
  Coffee,
  Wind,
  Shirt,
  Magnet,
  ClipboardList,
  DollarSign,
  Sparkles,
  Camera,
  Pencil,
  BedDouble,
  Loader2,
  Save,
  CheckCircle2,
  Mountain,
  Waves,
  Dumbbell,
  Trees,
  Building2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const AMENITY_LIST = [
  { key: "wifi", label: "WiFi", Icon: Wifi },
  { key: "ac", label: "A/C", Icon: AirVent },
  { key: "tv", label: "Smart TV", Icon: Tv },
  { key: "minibar", label: "Mini Bar", Icon: Wine },
  { key: "safe", label: "Safe Box", Icon: Lock },
  { key: "balcony", label: "Balcony", Icon: Sunset },
  { key: "jacuzzi", label: "Jacuzzi", Icon: Bath },
  { key: "kitchenette", label: "Kitchenette", Icon: UtensilsCrossed },
  { key: "coffeeMaker", label: "Coffee Maker", Icon: Coffee },
  { key: "hairDryer", label: "Hair Dryer", Icon: Wind },
  { key: "bathrobe", label: "Bathrobe", Icon: Shirt },
  { key: "ironing", label: "Iron & Board", Icon: Magnet },
];

const EMPTY_FORM = {
  number: "",
  name: "",
  floor: "",
  type: "room",
  category: "standard",
  capacity: 2,
  beds: 1,
  bedType: "double",
  bathrooms: 1,
  pricePerNight: "",
  currency: "USD",
  discount: 0,
  sizeM2: "",
  view: "none",
  status: "available",
  smokingAllowed: false,
  petsAllowed: false,
  description: "",
  amenities: {
    wifi: false,
    ac: false,
    tv: false,
    minibar: false,
    safe: false,
    balcony: false,
    jacuzzi: false,
    kitchenette: false,
    coffeeMaker: false,
    hairDryer: false,
    bathrobe: false,
    ironing: false,
  },
  images: [],
  thumbnail: null,
};

const inp = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 15,
  fontWeight: 500,
  color: "var(--text-primary)",
  width: "100%",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
};
const lbl = {
  display: "block",
  fontWeight: 700,
  fontSize: 13,
  color: "var(--text-primary)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};
const sectionTitle = {
  fontSize: 15,
  fontWeight: 800,
  color: "var(--text-primary)",
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: "1px solid var(--bg-raised)",
  marginTop: 8,
};

export default function RoomFormModal({
  open,
  onClose,
  onSave,
  room = null,
  pageMode = false,
}) {
  const { dir, t } = useLanguage();
  const isRtl = dir === "rtl";
  const [form, setForm] = useState(EMPTY_FORM);
  const [tab, setTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (room) {
      setForm({
        ...EMPTY_FORM,
        ...room,
        amenities: { ...EMPTY_FORM.amenities, ...(room.amenities || {}) },
        images: room.images || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setTab("basic");
    setError("");
  }, [room, open]);

  if (!open && !pageMode) return null;

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const setAmenity = (key, val) =>
    setForm((p) => ({ ...p, amenities: { ...p.amenities, [key]: val } }));

  const compressImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const MAX = 800;
          let w = img.width,
            h = img.height;
          if (w > h) {
            if (w > MAX) {
              h = Math.round((h * MAX) / w);
              w = MAX;
            }
          } else {
            if (h > MAX) {
              w = Math.round((w * MAX) / h);
              h = MAX;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const results = await Promise.all(files.map(compressImage));
    setForm((p) => {
      const merged = [...(p.images || []), ...results].slice(0, 8);
      return { ...p, images: merged, thumbnail: p.thumbnail || merged[0] };
    });
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setForm((p) => {
      const updated = p.images.filter((_, i) => i !== idx);
      return {
        ...p,
        images: updated,
        thumbnail:
          p.thumbnail === p.images[idx] ? updated[0] || null : p.thumbnail,
      };
    });
  };

  const setThumbnail = (url) => setForm((p) => ({ ...p, thumbnail: url }));

  const handleSubmit = async () => {
    if (!form.number.trim()) {
      setError(t("rm_errNumber"));
      setTab("basic");
      return;
    }
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
      setError(t("rm_errPrice"));
      setTab("pricing");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...form,
        pricePerNight: Number(form.pricePerNight),
        capacity: Number(form.capacity),
        beds: Number(form.beds),
        bathrooms: Number(form.bathrooms),
        discount: Number(form.discount || 0),
        sizeM2: form.sizeM2 ? Number(form.sizeM2) : undefined,
        floor: form.floor ? Number(form.floor) : undefined,
      });
      onClose();
    } catch (e) {
      setError(e?.data?.message || t("rm_errSave"));
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "basic", label: t("rm_tabBasic"), Icon: ClipboardList },
    { id: "pricing", label: t("rm_tabPricing"), Icon: DollarSign },
    { id: "amenities", label: t("rm_tabAmenities"), Icon: Sparkles },
    { id: "photos", label: t("rm_tabPhotos"), Icon: Camera },
  ];

  const currentStepIndex = TABS.findIndex((t) => t.id === tab);

  const handleNext = () => {
    if (tab === "basic" && !form.number.trim()) {
      return setError(t("rm_errNumber"));
    }
    if (
      tab === "pricing" &&
      (!form.pricePerNight || Number(form.pricePerNight) <= 0)
    ) {
      return setError(t("rm_errPrice"));
    }
    setError("");
    if (currentStepIndex < TABS.length - 1) {
      setTab(TABS[currentStepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    setError("");
    if (currentStepIndex > 0) {
      setTab(TABS[currentStepIndex - 1].id);
    }
  };

  const gridTwo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

  const innerContent = (
    <div
      style={{
        background: "var(--bg-surface)",
        borderRadius: pageMode ? 0 : 16,
        width: "100%",
        maxWidth: pageMode ? "none" : 680,
        maxHeight: pageMode ? "none" : "92vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: pageMode ? "none" : "0 25px 60px rgba(0,0,0,0.2)",
        border: "none",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Header & Stepper */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          borderRadius: "16px 16px 0 0",
          padding: "24px 32px",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              {room ? (
                <>
                  <Pencil size={18} className="inline mr-2" />
                  {t("rm_editTitle")}
                </>
              ) : (
                <>
                  <BedDouble size={18} className="inline mr-2" />
                  {t("rm_addTitle")}
                </>
              )}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              {t("rm_subtitle")}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              width: 38,
              height: 38,
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: 18,
              display: pageMode ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            ✕
          </button>
        </div>

        {/* Stepper UI */}
        <div className="flex items-center justify-between w-full relative pb-4">
          {/* Track */}
          <div className="absolute left-6 right-6 top-[18px] h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full z-0" />
          {/* Progress */}
          <div
            className="absolute left-6 top-[18px] h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full z-0 transition-all duration-500 ease-out"
            style={{
              width: `calc(${(currentStepIndex / (TABS.length - 1)) * 100}% - 48px)`,
            }}
          />
          {TABS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center group"
              >
                <div
                  onClick={() => isCompleted && setTab(step.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                    isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-600/20 scale-110"
                      : isCompleted
                        ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                        : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  ) : step.Icon ? (
                    <step.Icon size={16} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div
                  className={`absolute -bottom-8 w-max text-[12px] font-bold transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : isCompleted
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          overflowY: "auto",
          padding: "32px 32px",
          flex: 1,
          position: "relative",
        }}
      >
        {error && (
          <div
            className="animate-in fade-in slide-in-from-top-2"
            style={{
              background: "rgba(220, 38, 38, 0.12)",
              border: "1px solid rgba(220, 38, 38, 0.35)",
              borderRadius: 10,
              padding: "12px 16px",
              color: "var(--danger)",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          key={tab}
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          {/* ── BASIC TAB ── */}
          {tab === "basic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={sectionTitle}>{t("rm_secIdentity")}</p>
              <div style={gridTwo}>
                <div>
                  <label style={lbl}>{t("rm_fieldNumber")}</label>
                  <input
                    style={inp}
                    value={form.number}
                    onChange={(e) => set("number", e.target.value)}
                    placeholder="e.g. 101"
                  />
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldName")}</label>
                  <input
                    style={inp}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Ocean Suite"
                  />
                </div>
              </div>
              <div style={gridTwo}>
                <div>
                  <label style={lbl}>{t("rm_fieldType")}</label>
                  <select
                    style={inp}
                    value={form.type}
                    onChange={(e) => set("type", e.target.value)}
                  >
                    <option value="room">{t("rm_typeRoom")}</option>
                    <option value="suite">{t("rm_typeSuite")}</option>
                    <option value="studio">{t("rm_typeStudio")}</option>
                    <option value="villa">{t("rm_typeVilla")}</option>
                    <option value="table">{t("rm_typeTable")}</option>
                    <option value="service">{t("rm_typeService")}</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldCategory")}</label>
                  <select
                    style={inp}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    <option value="standard">{t("rm_catStandard")}</option>
                    <option value="deluxe">{t("rm_catDeluxe")}</option>
                    <option value="superior">{t("rm_catSuperior")}</option>
                    <option value="executive">{t("rm_catExecutive")}</option>
                    <option value="presidential">
                      {t("rm_catPresidential")}
                    </option>
                  </select>
                </div>
              </div>
              <div style={gridTwo}>
                <div>
                  <label style={lbl}>{t("rm_fieldFloor")}</label>
                  <input
                    style={inp}
                    type="number"
                    min="0"
                    value={form.floor}
                    onChange={(e) => set("floor", e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldStatus")}</label>
                  <select
                    style={inp}
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option value="available">
                      ✅ {t("rm_statusAvailable")}
                    </option>
                    <option value="occupied">
                      🔴 {t("rm_statusOccupied")}
                    </option>
                    <option value="reserved">
                      🟡 {t("rm_statusReserved")}
                    </option>
                    <option value="maintenance">
                      🔧 {t("rm_statusMaintenance")}
                    </option>
                  </select>
                </div>
              </div>

              <p style={sectionTitle}>{t("rm_secCapacity")}</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={lbl}>{t("rm_fieldGuests")}</label>
                  <input
                    style={inp}
                    type="number"
                    min="1"
                    max="20"
                    value={form.capacity}
                    onChange={(e) => set("capacity", e.target.value)}
                  />
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldBeds")}</label>
                  <input
                    style={inp}
                    type="number"
                    min="1"
                    max="10"
                    value={form.beds}
                    onChange={(e) => set("beds", e.target.value)}
                  />
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldBedType")}</label>
                  <select
                    style={inp}
                    value={form.bedType}
                    onChange={(e) => set("bedType", e.target.value)}
                  >
                    <option value="single">{t("rm_bedSingle")}</option>
                    <option value="double">{t("rm_bedDouble")}</option>
                    <option value="queen">{t("rm_bedQueen")}</option>
                    <option value="king">{t("rm_bedKing")}</option>
                    <option value="twin">{t("rm_bedTwin")}</option>
                    <option value="sofa">{t("rm_bedSofa")}</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldBathrooms")}</label>
                  <input
                    style={inp}
                    type="number"
                    min="1"
                    max="5"
                    value={form.bathrooms}
                    onChange={(e) => set("bathrooms", e.target.value)}
                  />
                </div>
              </div>

              <p style={sectionTitle}>{t("rm_secFeatures")}</p>
              <div style={gridTwo}>
                <div>
                  <label style={lbl}>{t("rm_fieldSize")}</label>
                  <input
                    style={inp}
                    type="number"
                    min="1"
                    value={form.sizeM2}
                    onChange={(e) => set("sizeM2", e.target.value)}
                    placeholder="e.g. 35"
                  />
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldView")}</label>
                  <select
                    style={inp}
                    value={form.view}
                    onChange={(e) => set("view", e.target.value)}
                  >
                    <option value="none">{t("rm_viewNone")}</option>
                    <option value="sea">{t("rm_viewSea")}</option>
                    <option value="pool">{t("rm_viewPool")}</option>
                    <option value="city">{t("rm_viewCity")}</option>
                    <option value="garden">{t("rm_viewGarden")}</option>
                    <option value="mountain">{t("rm_viewMountain")}</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.smokingAllowed}
                    onChange={(e) => set("smokingAllowed", e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  🚬 {t("rm_fieldSmoking")}
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.petsAllowed}
                    onChange={(e) => set("petsAllowed", e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  🐾 {t("rm_fieldPets")}
                </label>
              </div>

              <div>
                <label style={lbl}>{t("rm_fieldDesc")}</label>
                <textarea
                  style={{ ...inp, height: 90, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder={t("rm_descPlaceholder")}
                />
              </div>
            </div>
          )}

          {/* ── PRICING TAB ── */}
          {tab === "pricing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={sectionTitle}>{t("rm_secPricingDetails")}</p>
              <div style={gridTwo}>
                <div>
                  <label style={lbl}>{t("rm_fieldPrice")}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inp, paddingLeft: 36 }}
                      type="number"
                      min="0"
                      value={form.pricePerNight}
                      onChange={(e) => set("pricePerNight", e.target.value)}
                      placeholder="0.00"
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                        fontSize: 14,
                      }}
                    >
                      $
                    </span>
                  </div>
                </div>
                <div>
                  <label style={lbl}>{t("rm_fieldCurrency")}</label>
                  <select
                    style={inp}
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="AED">AED — UAE Dirham</option>
                    <option value="SAR">SAR — Saudi Riyal</option>
                    <option value="EGP">EGP — Egyptian Pound</option>
                    <option value="TRY">TRY — Turkish Lira</option>
                    <option value="MAD">MAD — Moroccan Dirham</option>
                  </select>
                </div>
              </div>
              <div style={{ maxWidth: 280 }}>
                <label style={lbl}>{t("rm_fieldDiscount")}</label>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => set("discount", e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Price summary card */}
              {form.pricePerNight > 0 && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand-muted), rgba(34, 197, 94, 0.12))",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--brand)",
                      marginBottom: 10,
                    }}
                  >
                    💡 {t("rm_pricingSummary")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>{t("rm_basePrice")}</span>
                      <span style={{ fontWeight: 700 }}>
                        {form.currency} {Number(form.pricePerNight).toFixed(2)}
                      </span>
                    </div>
                    {form.discount > 0 && (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "var(--danger)",
                          }}
                        >
                          <span>Discount ({form.discount}%)</span>
                          <span>
                            - {form.currency}{" "}
                            {(
                              (form.pricePerNight * form.discount) /
                              100
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: 700,
                            color: "var(--success)",
                            borderTop: "1px solid rgba(34, 197, 94, 0.18)",
                            paddingTop: 6,
                          }}
                        >
                          <span>{t("rm_finalPrice")}</span>
                          <span>
                            {form.currency}{" "}
                            {(
                              form.pricePerNight *
                              (1 - form.discount / 100)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-secondary)",
                        paddingTop: 4,
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <span>{t("rm_perWeek")}</span>
                      <span style={{ fontWeight: 600 }}>
                        {form.currency}{" "}
                        {(
                          form.pricePerNight *
                          (1 - form.discount / 100) *
                          7
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>{t("rm_perMonth")}</span>
                      <span style={{ fontWeight: 600 }}>
                        {form.currency}{" "}
                        {(
                          form.pricePerNight *
                          (1 - form.discount / 100) *
                          30
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AMENITIES TAB ── */}
          {tab === "amenities" && (
            <div>
              <p style={sectionTitle}>{t("rm_secAmenities")}</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 10,
                }}
              >
                {AMENITY_LIST.map(({ key, label, Icon: AmenityIcon }) => {
                  const active = form.amenities[key];
                  return (
                    <div
                      key={key}
                      onClick={() => setAmenity(key, !active)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `2px solid ${active ? "var(--brand)" : "var(--border)"}`,
                        background: active
                          ? "var(--brand-muted)"
                          : "var(--bg-raised)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        userSelect: "none",
                      }}
                    >
                      {AmenityIcon && (
                        <AmenityIcon
                          size={20}
                          style={{
                            color: active
                              ? "var(--brand)"
                              : "var(--text-muted)",
                          }}
                        />
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: active
                              ? "var(--brand)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: active
                              ? "var(--brand)"
                              : "var(--text-muted)",
                          }}
                        >
                          {active
                            ? t("rm_amenityIncluded")
                            : t("rm_amenityNotIncluded")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                Click to toggle amenities
              </div>
            </div>
          )}

          {/* ── PHOTOS TAB ── */}
          {tab === "photos" && (
            <div>
              <p style={sectionTitle}>{t("rm_secPhotos")}</p>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: 12,
                  padding: "28px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg-raised)",
                  marginBottom: 16,
                  transition: "border-color 0.15s",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter((f) =>
                    f.type.startsWith("image/"),
                  );
                  const results = await Promise.all(files.map(compressImage));
                  setForm((p) => {
                    const merged = [...(p.images || []), ...results].slice(
                      0,
                      8,
                    );
                    return {
                      ...p,
                      images: merged,
                      thumbnail: p.thumbnail || merged[0],
                    };
                  });
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("rm_photosUploadHint")}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  {t("rm_photosLimit")}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </div>

              {form.images.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 10,
                  }}
                >
                  {form.images.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: 10,
                        overflow: "hidden",
                        border:
                          form.thumbnail === url
                            ? "3px solid var(--brand)"
                            : "2px solid var(--border)",
                        aspectRatio: "4/3",
                      }}
                    >
                      <img
                        src={url}
                        alt={`room-${idx}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {form.thumbnail === url && (
                        <div
                          style={{
                            position: "absolute",
                            top: 6,
                            left: 6,
                            background: "var(--brand)",
                            borderRadius: 4,
                            padding: "2px 7px",
                            fontSize: 10,
                            color: "#fff",
                            fontWeight: 700,
                          }}
                        >
                          MAIN
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          display: "flex",
                          background: "rgba(0,0,0,0.55)",
                          padding: "5px 8px",
                          gap: 6,
                        }}
                      >
                        <button
                          onClick={() => setThumbnail(url)}
                          title="Set as main"
                          style={{
                            flex: 1,
                            background: "rgba(255,255,255,0.18)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            fontSize: 11,
                            cursor: "pointer",
                            padding: "3px 0",
                          }}
                        >
                          ⭐ {t("rm_photoSetMain")}
                        </button>
                        <button
                          onClick={() => removeImage(idx)}
                          title="Remove"
                          style={{
                            background: "rgba(239,68,68,0.8)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            fontSize: 16,
                            cursor: "pointer",
                            padding: "2px 8px",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Nav */}
      <div
        style={{
          padding: "20px 32px",
          background: "var(--bg-raised)",
          borderTop: "1px solid var(--border)",
          borderRadius: pageMode ? 0 : "0 0 16px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {currentStepIndex > 0 ? (
            <button
              onClick={handlePrev}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              ← {t("back") || "Back"}
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                display: pageMode ? "none" : "block",
              }}
            >
              {t("cancel")}
            </button>
          )}
        </div>

        <div>
          {currentStepIndex < TABS.length - 1 ? (
            <button
              onClick={handleNext}
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                border: "none",
                background:
                  "linear-gradient(135deg, var(--brand), var(--brand))",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              }}
            >
              {t("next") || "Next"} →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                border: "none",
                background: saving
                  ? "var(--brand-muted)"
                  : "linear-gradient(135deg, var(--brand), var(--brand))",
                color: "#fff",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="inline mr-1.5 animate-spin" />
                  {t("saving")}
                </>
              ) : room ? (
                <>
                  <Save size={15} className="inline mr-1.5" />
                  {t("rm_updateBtn")}
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} className="inline mr-1.5" />
                  {t("rm_addBtn")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (pageMode) return innerContent;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {innerContent}
    </div>
  );
}
