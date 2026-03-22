import { useState, useRef } from "react";
import {
  Plus,
  Upload,
  Trash2,
  Pencil,
  Check,
  X,
  Image as ImageIcon,
  Tag,
  Bell,
} from "lucide-react";
import {
  useGetIconsQuery,
  useGetIconRequestsQuery,
  useCreateIconMutation,
  useUpdateIconMutation,
  useDeleteIconMutation,
} from "../store/services/api";
import { useLanguage } from "../context/LanguageContext";

const CATEGORIES = [
  { value: "hotel", key: "hotel" },
  { value: "room", key: "room" },
  { value: "activity", key: "activity" },
  { value: "other", key: "other" },
];

const COPY = {
  en: {
    title: "Icons Library",
    subtitle: "Manage hotel amenity icons and handle design requests",
    addIcon: "Add Icon",
    cancel: "Cancel",
    iconsTab: "Icons",
    requestsTab: "Requested Icons",
    uploadDesign: "Upload design",
    englishName: "English name",
    englishNameRequired: "English name *",
    arabicName: "Arabic name",
    newIcon: "New Icon",
    saveIcon: "Save Icon",
    loading: "Loading...",
    emptyIcons: "No icons yet. Add your first icon above.",
    emptyRequests: "No pending icon requests.",
    deleteConfirm: "Delete this icon?",
    categories: {
      all: "All",
      hotel: "Hotels",
      room: "Rooms",
      activity: "Activities",
      other: "Other",
    },
  },
  ar: {
    title: "مكتبة الأيقونات",
    subtitle: "إدارة أيقونات مرافق الفندق والتعامل مع طلبات التصميم",
    addIcon: "إضافة أيقونة",
    cancel: "إلغاء",
    iconsTab: "الأيقونات",
    requestsTab: "الأيقونات المطلوبة",
    uploadDesign: "رفع التصميم",
    englishName: "الاسم بالإنجليزية",
    englishNameRequired: "الاسم بالإنجليزية *",
    arabicName: "الاسم بالعربية",
    newIcon: "أيقونة جديدة",
    saveIcon: "حفظ الأيقونة",
    loading: "جارٍ التحميل...",
    emptyIcons: "لا توجد أيقونات بعد. أضف أول أيقونة من الأعلى.",
    emptyRequests: "لا توجد طلبات أيقونات معلقة.",
    deleteConfirm: "هل تريد حذف هذه الأيقونة؟",
    categories: {
      all: "الكل",
      hotel: "الفنادق",
      room: "الغرف",
      activity: "الأنشطة",
      other: "أخرى",
    },
  },
};

// Converts a File → base64 data URL
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DefaultIconPlaceholder({ size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--bg-raised)",
        border: "1px dashed var(--border)",
        flexShrink: 0,
      }}
    >
      <ImageIcon size={size * 0.4} style={{ color: "var(--text-muted)" }} />
    </div>
  );
}

// ── Inline edit form for label / labelAr / category ─────────────────────────
function IconEditRow({ icon, onSave, onCancel }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const [label, setLabel] = useState(icon.label);
  const [labelAr, setLabelAr] = useState(icon.labelAr || "");
  const [category, setCategory] = useState(icon.category || "hotel");

  const save = () => {
    if (!label.trim()) return;
    onSave({ label: label.trim(), labelAr: labelAr.trim(), category });
  };

  return (
    <div className="flex flex-wrap gap-2 flex-1">
      <input
        className="input flex-1 min-w-[120px] text-sm h-8"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={copy.englishName}
        dir="ltr"
      />
      <input
        className="input flex-1 min-w-[120px] text-sm h-8"
        value={labelAr}
        onChange={(e) => setLabelAr(e.target.value)}
        placeholder={copy.arabicName}
        dir="rtl"
      />
      <select
        className="input text-sm h-8"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {copy.categories[c.key]}
          </option>
        ))}
      </select>
      <button
        onClick={save}
        className="h-8 w-8 flex items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--sidebar-active-text)", color: "#fff" }}
      >
        <Check size={14} />
      </button>
      <button
        onClick={onCancel}
        className="h-8 w-8 flex items-center justify-center rounded-lg"
        style={{
          backgroundColor: "var(--bg-raised)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Single icon card row ─────────────────────────────────────────────────────
function IconRow({ icon, onUpload, onEdit, onDelete, isRequested = false }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const fileRef = useRef(null);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Icon image or placeholder */}
      {icon.imageUrl ? (
        <img
          src={icon.imageUrl}
          alt={icon.label}
          className="rounded-xl object-contain bg-white"
          style={{
            width: 40,
            height: 40,
            border: "1px solid var(--border)",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 40,
            height: 40,
            backgroundColor: isRequested ? "#fef3c7" : "var(--bg-raised)",
            border: `1px dashed ${isRequested ? "#f59e0b" : "var(--border)"}`,
            flexShrink: 0,
          }}
        >
          {isRequested ? (
            <Check size={18} style={{ color: "#d97706" }} />
          ) : (
            <ImageIcon size={16} style={{ color: "var(--text-muted)" }} />
          )}
        </div>
      )}

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {icon.label}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {icon.labelAr && (
            <span
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
              dir="rtl"
            >
              {icon.labelAr}
            </span>
          )}
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize"
            style={{
              backgroundColor: "var(--brand-muted)",
              color: "var(--sidebar-active-text)",
            }}
          >
            {copy.categories[icon.category] || icon.category}
          </span>
          {isRequested && icon.requestedByHotelName && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
              }}
            >
              {icon.requestedByHotelName}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Upload design */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(icon, f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          title={copy.uploadDesign}
          className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--bg-raised)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Upload size={14} />
        </button>

        {/* Edit labels */}
        <button
          onClick={() => onEdit(icon)}
          title={lang === "ar" ? "تعديل" : "Edit"}
          className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--bg-raised)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Pencil size={13} />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(icon._id)}
          title={lang === "ar" ? "حذف" : "Delete"}
          className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Add new icon form ────────────────────────────────────────────────────────
function AddIconForm({ onClose }) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const [label, setLabel] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [category, setCategory] = useState("hotel");
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef(null);
  const [createIcon] = useCreateIconMutation();

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    setImageUrl(b64);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!label.trim()) return;
    await createIcon({
      label: label.trim(),
      labelAr: labelAr.trim(),
      category,
      imageUrl,
    });
    onClose();
  };

  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px dashed var(--border)",
      }}
    >
      <p
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {copy.newIcon}
      </p>
      <div className="flex flex-wrap gap-3">
        {/* Image preview */}
        <div
          className="relative flex items-center justify-center rounded-xl overflow-hidden cursor-pointer"
          style={{
            width: 64,
            height: 64,
            border: "1px dashed var(--border)",
            backgroundColor: "var(--bg-raised)",
            flexShrink: 0,
          }}
          onClick={() => fileRef.current?.click()}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <Upload size={20} style={{ color: "var(--text-muted)" }} />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileRef}
            onChange={handleFile}
          />
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <input
            className="input text-sm h-8"
            placeholder={copy.englishNameRequired}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            dir="ltr"
          />
          <input
            className="input text-sm h-8"
            placeholder={copy.arabicName}
            value={labelAr}
            onChange={(e) => setLabelAr(e.target.value)}
            dir="rtl"
          />
          <select
            className="input text-sm h-8"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {copy.categories[c.key]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onClose}
          className="h-8 px-4 rounded-xl text-xs"
          style={{
            backgroundColor: "var(--bg-raised)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          {copy.cancel}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!label.trim()}
          className="h-8 px-4 rounded-xl text-xs font-semibold"
          style={{
            backgroundColor: label.trim()
              ? "var(--sidebar-active-text)"
              : "var(--bg-raised)",
            color: label.trim() ? "#fff" : "var(--text-muted)",
          }}
        >
          {copy.saveIcon}
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SuperAdminIconsPage() {
  const { lang, dir } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const [activeTab, setActiveTab] = useState("icons"); // "icons" | "requests"
  const [filterCat, setFilterCat] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: allIcons = [], isLoading } = useGetIconsQuery();
  const { data: requestedIcons = [] } = useGetIconRequestsQuery();
  const [updateIcon] = useUpdateIconMutation();
  const [deleteIcon] = useDeleteIconMutation();

  // designed icons only
  const designedIcons = allIcons.filter((ic) => ic.status === "designed");

  const filtered =
    filterCat === "all"
      ? designedIcons
      : designedIcons.filter((ic) => ic.category === filterCat);

  const handleUpload = async (icon, file) => {
    const imageUrl = await fileToBase64(file);
    await updateIcon({ _id: icon._id, imageUrl, status: "designed" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(copy.deleteConfirm)) return;
    await deleteIcon(id);
  };

  const handleEditSave = async (icon, changes) => {
    await updateIcon({ _id: icon._id, ...changes });
    setEditingId(null);
  };

  const handleRequestUpload = async (icon, file) => {
    const imageUrl = await fileToBase64(file);
    await updateIcon({ _id: icon._id, imageUrl, status: "designed" });
  };

  return (
    <div className="page-shell" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--sidebar-active-text)" }}
          >
            {copy.title}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {copy.subtitle}
          </p>
        </div>
        {activeTab === "icons" && (
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: showAddForm
                ? "var(--bg-raised)"
                : "var(--sidebar-active-text)",
              color: showAddForm ? "var(--text-secondary)" : "#fff",
              border: `1px solid ${showAddForm ? "var(--border)" : "var(--sidebar-active-text)"}`,
            }}
          >
            {showAddForm ? <X size={15} /> : <Plus size={15} />}
            {showAddForm ? copy.cancel : copy.addIcon}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6 w-fit"
        style={{ backgroundColor: "var(--bg-raised)" }}
      >
        {[
          { key: "icons", label: copy.iconsTab, count: designedIcons.length },
          {
            key: "requests",
            label: copy.requestsTab,
            count: requestedIcons.length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor:
                activeTab === tab.key
                  ? "var(--sidebar-active-text)"
                  : "transparent",
              color: activeTab === tab.key ? "#fff" : "var(--text-secondary)",
            }}
          >
            {tab.key === "requests" && tab.count > 0 && <Bell size={13} />}
            {tab.label}
            {tab.count > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    activeTab === tab.key
                      ? "rgba(255,255,255,0.25)"
                      : "var(--brand-muted)",
                  color:
                    activeTab === tab.key
                      ? "#fff"
                      : "var(--sidebar-active-text)",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Icons tab ───────────────────────────────────────────── */}
      {activeTab === "icons" && (
        <>
          {showAddForm && <AddIconForm onClose={() => setShowAddForm(false)} />}

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: "all", label: copy.categories.all },
              ...CATEGORIES.map((cat) => ({
                value: cat.value,
                label: copy.categories[cat.key],
              })),
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCat(cat.value)}
                className="h-8 px-3 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    filterCat === cat.value
                      ? "var(--sidebar-active-text)"
                      : "var(--bg-raised)",
                  color:
                    filterCat === cat.value ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${filterCat === cat.value ? "var(--sidebar-active-text)" : "var(--border)"}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div
              className="text-sm text-center py-12"
              style={{ color: "var(--text-muted)" }}
            >
              {copy.loading}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-16"
              style={{ color: "var(--text-muted)" }}
            >
              <Tag size={32} />
              <p className="text-sm">{copy.emptyIcons}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((icon) =>
                editingId === icon._id ? (
                  <div
                    key={icon._id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {icon.imageUrl ? (
                      <img
                        src={icon.imageUrl}
                        alt={icon.label}
                        className="rounded-xl object-contain"
                        style={{ width: 40, height: 40, flexShrink: 0 }}
                      />
                    ) : (
                      <DefaultIconPlaceholder />
                    )}
                    <IconEditRow
                      icon={icon}
                      onSave={(changes) => handleEditSave(icon, changes)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <IconRow
                    key={icon._id}
                    icon={icon}
                    onUpload={handleUpload}
                    onEdit={(ic) => setEditingId(ic._id)}
                    onDelete={handleDelete}
                  />
                ),
              )}
            </div>
          )}
        </>
      )}

      {/* ── Requested Icons tab ─────────────────────────────────── */}
      {activeTab === "requests" && (
        <>
          {requestedIcons.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-16"
              style={{ color: "var(--text-muted)" }}
            >
              <Bell size={32} />
              <p className="text-sm">{copy.emptyRequests}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {requestedIcons.map((icon) =>
                editingId === icon._id ? (
                  <div
                    key={icon._id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <DefaultIconPlaceholder />
                    <IconEditRow
                      icon={icon}
                      onSave={(changes) => handleEditSave(icon, changes)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <IconRow
                    key={icon._id}
                    icon={icon}
                    onUpload={handleRequestUpload}
                    onEdit={(ic) => setEditingId(ic._id)}
                    onDelete={handleDelete}
                    isRequested
                  />
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
