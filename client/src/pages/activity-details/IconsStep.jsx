import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, X, Image as ImageIcon } from "lucide-react";
import ActivityDetailsStepBar from "../../components/ActivityDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";
import {
  useGetIconsQuery,
  useRequestIconMutation,
} from "../../store/services/api";

const COPY = {
  en: {
    title: "Activity Features",
    subtitle: "Select the features your activity offers. Can't find one? Request it below.",
    selected: "selected",
    requestIcon: "Request Icon",
    cancel: "Cancel",
    categories: { hotel: "Hotels", room: "Rooms", activity: "Activities", other: "Other" },
    requestHint: "Request a new icon and the super admin can design it for your activity and the shared library.",
    iconNameEn: "Icon name (English) *",
    iconNameAr: "Icon name (Arabic)",
    sending: "Sending...",
    send: "Send Request",
    loading: "Loading icons...",
    noIcons: "No icons in this category yet.",
    requestNew: "Request a new icon",
    pendingRequests: "Pending Design Requests",
    awaitingDesign: "Awaiting Design",
    requestFailed: "Failed to send request. Please try again.",
    next: "Next -> Policy",
    back: "Back",
  },
  ar: {
    title: "مميزات النشاط",
    subtitle: "اختر المميزات المتاحة في النشاط. إذا لم تجد ما يناسبك يمكنك طلب أيقونة جديدة.",
    selected: "تم اختيارها",
    requestIcon: "طلب أيقونة",
    cancel: "إلغاء",
    categories: { hotel: "الفندق", room: "الغرف", activity: "الأنشطة", other: "أخرى" },
    requestHint: "اطلب أيقونة جديدة وسيتمكن السوبر أدمن من تصميمها لهذا النشاط وللمكتبة المشتركة.",
    iconNameEn: "اسم الأيقونة بالإنجليزية *",
    iconNameAr: "اسم الأيقونة بالعربية",
    sending: "جارٍ الإرسال...",
    send: "إرسال الطلب",
    loading: "جارٍ تحميل الأيقونات...",
    noIcons: "لا توجد أيقونات في هذا القسم حالياً.",
    requestNew: "اطلب أيقونة جديدة",
    pendingRequests: "طلبات التصميم المعلقة",
    awaitingDesign: "بانتظار التصميم",
    requestFailed: "تعذر إرسال الطلب. حاول مرة أخرى.",
    next: "التالي -> السياسة",
    back: "رجوع",
  },
};

function DefaultIconPlaceholder({ isRequested = false, size = 40 }) {
  return (
    <div className="flex items-center justify-center rounded-xl flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: isRequested ? "#fef3c7" : "var(--bg-raised)", border: `1px dashed ${isRequested ? "#f59e0b" : "var(--border)"}` }}>
      {isRequested ? <Check size={size * 0.4} style={{ color: "#d97706" }} /> : <ImageIcon size={size * 0.38} style={{ color: "var(--text-muted)" }} />}
    </div>
  );
}

const STORAGE_KEY = "activity_details_icons";

export default function ActivityIconsStep() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;

  const { data: icons = [], isLoading } = useGetIconsQuery();
  const [requestIcon, { isLoading: requesting }] = useRequestIconMutation();

  const [activeCategory, setActiveCategory] = useState("activity");
  const [selected, setSelected] = useState(new Set());
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLabelAr, setNewLabelAr] = useState("");
  const [error, setError] = useState("");
  const [requestedItems, setRequestedItems] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.selectedIcons?.length) setSelected(new Set(saved.selectedIcons));
    if (saved?.requestedItems) setRequestedItems(saved.requestedItems);
  }, []);

  useEffect(() => {
    if (!icons.length) return;
    setRequestedItems((prev) => {
      if (!prev.length) return prev;
      const normalized = (v) => String(v || "").trim().toLowerCase();
      const next = prev.filter((reqItem) => !icons.some((icon) => {
        if (icon.status !== "designed") return false;
        const rc = reqItem.category || icon.category;
        return String(icon._id) === String(reqItem.id) ||
          (normalized(icon.label) === normalized(reqItem.label) && normalized(icon.category) === normalized(rc)) ||
          (reqItem.labelAr && normalized(icon.labelAr) === normalized(reqItem.labelAr) && normalized(icon.category) === normalized(rc));
      }));
      if (next.length !== prev.length) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedIcons: [...selected], requestedItems: next }));
      }
      return next;
    });
  }, [icons, selected]);

  const filteredIcons = icons.filter((icon) => icon.category === activeCategory && icon.status === "designed");

  const toggle = (id) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    setError("");
  };

  const handleRequest = async () => {
    if (!newLabel.trim()) return;
    try {
      const result = await requestIcon({ label: newLabel.trim(), labelAr: newLabelAr.trim(), category: activeCategory }).unwrap();
      setRequestedItems((prev) => [...prev, { id: result._id, label: result.label, labelAr: result.labelAr, category: result.category || activeCategory }]);
      setNewLabel(""); setNewLabelAr(""); setShowRequestForm(false);
    } catch { setError(copy.requestFailed); }
  };

  const handleNext = () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedIcons: [...selected], requestedItems }));
    navigate("/activity/details/policy");
  };

  return (
    <div className="page-shell">
      <ActivityDetailsStepBar />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold" style={{ color: "var(--sidebar-active-text)" }}>{copy.title}</h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selected.size > 0 && (
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: "rgba(29,78,216,0.1)", color: "var(--sidebar-active-text)" }}>
              {selected.size} {copy.selected}
            </span>
          )}
          <button onClick={() => setShowRequestForm((v) => !v)}
            className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all"
            style={{ backgroundColor: showRequestForm ? "var(--bg-raised)" : "var(--sidebar-active-text)", color: showRequestForm ? "var(--text-secondary)" : "#fff", border: `1px solid ${showRequestForm ? "var(--border)" : "var(--sidebar-active-text)"}` }}>
            {showRequestForm ? <X size={14} /> : <Plus size={14} />}
            {showRequestForm ? copy.cancel : copy.requestIcon}
          </button>
        </div>
      </div>

      <div className="mb-5 flex w-full gap-1 overflow-x-auto rounded-2xl p-1 sm:w-fit" style={{ backgroundColor: "var(--bg-raised)" }}>
        {Object.entries(copy.categories).map(([value, label]) => (
          <button key={value} onClick={() => setActiveCategory(value)}
            className="h-8 whitespace-nowrap rounded-xl px-4 text-xs font-medium transition-all"
            style={{ backgroundColor: activeCategory === value ? "var(--sidebar-active-text)" : "transparent", color: activeCategory === value ? "#fff" : "var(--text-secondary)" }}>
            {label}
          </button>
        ))}
      </div>

      {showRequestForm && (
        <div className="mb-5 rounded-2xl p-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border)" }}>
          <p className="mb-3 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{copy.requestHint}</p>
          <div className="flex flex-col gap-2 md:flex-row">
            <input className="input h-10 flex-1 text-sm" placeholder={copy.iconNameEn} value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)} dir="ltr" onKeyDown={(e) => e.key === "Enter" && handleRequest()} />
            <input className="input h-10 flex-1 text-sm" placeholder={copy.iconNameAr} value={newLabelAr}
              onChange={(e) => setNewLabelAr(e.target.value)} dir="rtl" />
            <button onClick={handleRequest} disabled={!newLabel.trim() || requesting}
              className="h-10 rounded-xl px-5 text-sm font-semibold"
              style={{ backgroundColor: newLabel.trim() ? "var(--sidebar-active-text)" : "var(--bg-raised)", color: newLabel.trim() ? "#fff" : "var(--text-muted)" }}>
              {requesting ? copy.sending : copy.send}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>{copy.loading}</div>
      ) : filteredIcons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl py-12" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border)" }}>
          <ImageIcon size={32} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{copy.noIcons}</p>
          <button onClick={() => setShowRequestForm(true)} className="text-xs font-semibold underline" style={{ color: "var(--sidebar-active-text)" }}>{copy.requestNew}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filteredIcons.map((icon) => {
            const isSelected = selected.has(icon._id);
            const primaryLabel = lang === "ar" && icon.labelAr ? icon.labelAr : icon.label;
            const secondaryLabel = lang === "ar" ? icon.label : icon.labelAr;
            return (
              <button key={icon._id} onClick={() => toggle(icon._id)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                style={{ backgroundColor: isSelected ? "rgba(29,78,216,0.06)" : "var(--bg-surface)", border: `1.5px solid ${isSelected ? "var(--sidebar-active-text)" : "var(--border)"}` }}>
                {icon.imageUrl ? <img src={icon.imageUrl} alt={primaryLabel} className="h-10 w-10 flex-shrink-0 rounded-xl object-contain" /> : <DefaultIconPlaceholder />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: isSelected ? "var(--sidebar-active-text)" : "var(--text-primary)" }} dir={lang === "ar" ? "rtl" : "ltr"}>{primaryLabel}</p>
                  {secondaryLabel && <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-muted)" }} dir={lang === "ar" ? "ltr" : "rtl"}>{secondaryLabel}</p>}
                </div>
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: isSelected ? "var(--sidebar-active-text)" : "var(--bg-raised)", border: `2px solid ${isSelected ? "var(--sidebar-active-text)" : "var(--border)"}` }}>
                  {isSelected && <Check size={11} strokeWidth={3} style={{ color: "#fff" }} />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {requestedItems.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{copy.pendingRequests}</p>
          <div className="flex flex-col gap-2">
            {requestedItems.map((item) => {
              const primaryLabel = lang === "ar" && item.labelAr ? item.labelAr : item.label;
              const secondaryLabel = lang === "ar" ? item.label : item.labelAr;
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "#fffff0", border: "1px dashed #f59e0b" }}>
                  <DefaultIconPlaceholder isRequested size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold" style={{ color: "#92400e" }} dir={lang === "ar" ? "rtl" : "ltr"}>{primaryLabel}</p>
                    {secondaryLabel && <p className="mt-0.5 truncate text-xs" style={{ color: "#b45309" }} dir={lang === "ar" ? "ltr" : "rtl"}>{secondaryLabel}</p>}
                  </div>
                  <span className="whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>{copy.awaitingDesign}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="input-error mb-2 mt-4">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button onClick={() => navigate("/activity/details/description")} className="btn btn-secondary rounded-2xl px-6 py-3 text-sm font-semibold">{copy.back}</button>
        <button onClick={handleNext} className="btn btn-primary rounded-2xl px-8 py-3 text-sm font-semibold" style={{ backgroundColor: "var(--sidebar-active-text)" }}>{copy.next}</button>
      </div>
    </div>
  );
}
