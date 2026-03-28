import { useRef, useState } from "react";
import {
  DoorOpen,
  Plus,
  Search,
  Pencil,
  Eye,
  EyeOff,
  X,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Users,
  Baby,
  Trash2,
  BedSingle,
  BedDouble,
  Layers,
  Smile,
  AirVent,
  Wine,
  Lock,
  Sun,
  Tv2,
  Wind,
  Shirt,
  Coffee,
  Waves,
  ShowerHead,
  Wifi,
  Utensils,
  ChefHat,
} from "lucide-react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useLanguage } from "../../../context/LanguageContext";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";

const INITIAL_GROUPS = [
  { id: "1", name: "Egyptian Market", currency: "EGP" },
  { id: "2", name: "Gulf Market", currency: "SAR" },
  { id: "3", name: "European Market", currency: "EUR" },
];

const INITIAL_PERIODS = [
  { id: "1", name: "Low Season" },
  { id: "2", name: "Mid Season" },
  { id: "3", name: "High Season" },
  { id: "4", name: "Peak Season" },
];

const ROOM_TYPES_OPTIONS = [
  "DBL Room",
  "SGL Room",
  "TPL Room",
  "Suite Room",
  "Family Room",
  "Studio",
];

const PRICE_FORMULA_DIRECTIONS = [
  { value: "add", labelKey: "formulaAdd" },
  { value: "less", labelKey: "formulaLess" },
];

const AMENITIES = [
  { label: "تكييف هواء", Icon: AirVent },
  { label: "مني بار", Icon: Wine },
  { label: "خزنة", Icon: Lock },
  { label: "شرفة", Icon: Sun },
  { label: "تلفاز", Icon: Tv2 },
  { label: "مجفف شعر", Icon: Wind },
  { label: "مكواة", Icon: Shirt },
  { label: "ماكينة قهوة", Icon: Coffee },
  { label: "حوض استحمام", Icon: Waves },
  { label: "دش", Icon: ShowerHead },
  { label: "إنترنت واي فاي", Icon: Wifi },
  { label: "إفطار مجاني", Icon: Utensils },
  { label: "مطبخ صغير", Icon: ChefHat },
];

const AMENITY_ICON_MAP = Object.fromEntries(AMENITIES.map(({ label, Icon }) => [label, Icon]));

const INITIAL_ROOM_TYPES = [
  {
    id: "dbl",
    code: "DBL",
    nameEn: "Standard Double room - Sea View",
    nameAr: "غرفة مزدوجة قياسية - إطلالة بحرية",
    descEn: "Double room with sea view",
    descAr: "غرفة مزدوجة مع إطلالة على البحر",
    roomType: "DBL Room",
    amenities: ["تكييف هواء", "تلفاز", "مكواة", "ماكينة قهوة", "مجفف شعر"],
    capacityOptions: [{ adults: 1, children: 1 }],
    priceDiffs: {},
    isBase: true,
    mainImage: null,
    gallery: [],
  },
  {
    id: "dbl2",
    code: "DBL",
    nameEn: "Standard Double room",
    nameAr: "غرفة مزدوجة قياسية",
    descEn: "Standard double room",
    descAr: "غرفة مزدوجة قياسية",
    roomType: "DBL Room",
    amenities: ["تكييف هواء", "تلفاز", "مكواة", "ماكينة قهوة", "مجفف شعر"],
    capacityOptions: [{ adults: 1, children: 1 }],
    priceDiffs: {},
    isBase: false,
    mainImage: null,
    gallery: [],
  },
];

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const s = i + 1;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={
                active
                  ? {
                      backgroundColor: "var(--sidebar-active-text)",
                      color: "#fff",
                    }
                  : done
                    ? {
                        backgroundColor: "var(--bg-raised)",
                        color: "var(--sidebar-active-text)",
                        border: "2px solid var(--sidebar-active-text)",
                      }
                    : {
                        backgroundColor: "var(--bg-raised)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
              }
            >
              {done ? <Check size={14} /> : s}
            </div>
            {s < total && (
              <div
                className="w-8 h-0.5"
                style={{
                  backgroundColor: done
                    ? "var(--sidebar-active-text)"
                    : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const CHILD_TYPES = ["Infant", "under 6 y", "at 12 year"];
const CHILD_PRICE_TYPES = ["Free", "Fixed Percent", "Adult 1/2", "Fixed Amount"];

const BED_TYPES = [
  { key: "singleBed", labelKey: "singleBed", Icon: BedSingle },
  { key: "extraDoubleBed", labelKey: "extraDoubleBed", Icon: BedDouble },
  { key: "extraLargeBed", labelKey: "extraLargeBed", Icon: BedDouble },
];

const TXT = {
  en: {
    pageTitle: "Room Types",
    pageSubtitle: "Manage room types and capacity",
    add: "Add",
    dblInfo: "Double Room (DBL) is the required first room and is used as the base for pricing all other rooms",
    searchPlaceholder: "Search...",
    noRooms: "No rooms yet",
    deleteBaseTitle: "Delete Base Room",
    deleteBaseMsg: "This is the base room (DBL) on which all price calculations are built. It cannot be deleted individually. Confirming will delete all associated rooms.",
    deleteBaseWarning: "rooms will be permanently deleted",
    deleteAll: "Delete All",
    cancel: "Cancel",
    roomDetails: "Room Details",
    nameArLabel: "Name (Arabic)",
    nameEnLabel: "Name (English)",
    codeLabel: "Code",
    roomTypeLabel: "Room Type",
    amenitiesLabel: "Amenities",
    capacityLabel: "Capacity",
    optionLabel: "Option",
    adultLabel: "adults",
    childLabel: "children",
    close: "Close",
    addRoomTitle: "Add Room Type",
    editRoomTitle: "Edit Room",
    stepTitles: ["Details", "Images", "Capacity", "Beds & Prices"],
    nameLabel: "Name",
    descLabel: "Description",
    roomAmenities: "Room Amenities",
    mainImageLabel: "Main Image",
    clickToUpload: "Click to upload main image",
    galleryLabel: "Gallery",
    dragOrClick: "Drag images here or click to upload",
    uploadPhotos: "Upload Photos",
    capacityOption: "Capacity Option",
    childSettings: "Child Settings",
    addCapacityOption: "+ Add Capacity Option",
    removeOption: "Remove this option",
    priceDiffNote: "Price difference from DBL room per period and guest group",
    singleBed: "Single Bed",
    extraDoubleBed: "Extra Double Bed",
    extraLargeBed: "Extra Large Bed",
    otherBeds: "Other",
    bedNamePlaceholder: "Bed name",
    priceDiffPerGroup: "Price difference per group (+ or -)",
    addBedOption: "Add Bed Option",
    bedOptions: "Bed Options",
    back: "Back",
    save: "Save",
    priceFormulaLabel: "Price Formula",
    formulaAdd: "Add to DBL Price",
    formulaLess: "Less than DBL Price",
    priceMethodFixed: "Fixed Amount",
    priceMethodPct: "% Percentage",
    pctAdd: "% Add",
    pctSubtract: "% Subtract",
    roomTypeFormLabel: "Room Type",
    capOptionsTitle: "Capacity Options",
    free: "Free",
    paid: "Paid",
  },
  ar: {
    pageTitle: "أنواع الغرف",
    pageSubtitle: "إدارة أنواع الغرف والسعة",
    add: "إضافة",
    dblInfo: "الغرفة المزدوجة (DBL) هي الغرفة الإجبارية الأولى وتُستخدم كأساس لحساب أسعار باقي الغرف",
    searchPlaceholder: "بحث...",
    noRooms: "لا توجد غرف بعد",
    deleteBaseTitle: "حذف الغرفة الأساسية",
    deleteBaseMsg: "هذه هي الغرفة الأساسية (DBL) التي يتم بناء جميع حسابات الأسعار عليها. لا يمكن حذفها بشكل منفرد. في حالة التأكيد سيتم حذف جميع الغرف المرتبطة بها.",
    deleteBaseWarning: "غرفة نهائياً",
    deleteAll: "حذف الكل",
    cancel: "إلغاء",
    roomDetails: "تفاصيل الغرفة",
    nameArLabel: "الاسم (عربي)",
    nameEnLabel: "الاسم (إنجليزي)",
    codeLabel: "الرمز",
    roomTypeLabel: "نوع الغرفة",
    amenitiesLabel: "المرافق",
    capacityLabel: "السعة",
    optionLabel: "خيار",
    adultLabel: "بالغ",
    childLabel: "طفل",
    close: "إغلاق",
    addRoomTitle: "إضافة نوع غرفة",
    editRoomTitle: "تعديل الغرفة",
    stepTitles: ["التفاصيل", "الصور", "السعة", "الأسرة والأسعار"],
    nameLabel: "الاسم",
    descLabel: "الوصف",
    roomAmenities: "مرافق الغرفة",
    mainImageLabel: "الصورة الرئيسية",
    clickToUpload: "انقر لرفع صورة رئيسية",
    galleryLabel: "معرض الصور",
    dragOrClick: "اسحب الصور هنا أو انقر للرفع",
    uploadPhotos: "رفع صور",
    capacityOption: "خيار السعة",
    childSettings: "إعدادات الأطفال",
    addCapacityOption: "+ إضافة خيار سعة",
    removeOption: "حذف هذا الخيار",
    priceDiffNote: "فرق السعر بين هذه الغرفة والغرفة المزدوجة (DBL) لكل فترة ومجموعة ضيوف",
    singleBed: "Single Bed",
    extraDoubleBed: "Extra Double Bed",
    extraLargeBed: "Extra Large Bed",
    otherBeds: "Other",
    bedNamePlaceholder: "Bed name",
    priceDiffPerGroup: "فرق السعر لكل مجموعة (+ أو -)",
    addBedOption: "إضافة خيار سرير",
    bedOptions: "خيارات الأسرة",
    back: "رجوع",
    save: "حفظ",
    priceFormulaLabel: "معادلة حساب السعر",
    formulaAdd: "Add to DBL Price",
    formulaLess: "Less than DBL Price",
    priceMethodFixed: "Fixed Amount",
    priceMethodPct: "% Percentage",
    pctAdd: "% Add",
    pctSubtract: "% Subtract",
    roomTypeFormLabel: "نوع الغرفة",
    capOptionsTitle: "خيارات السعة",
    free: "مجاني",
    paid: "مدفوع",
  },
};

const STEP_TITLES = ["التفاصيل", "الصور", "السعة", "الأسرة والأسعار"];

const EMPTY_FORM = {
  code: "",
  nameEn: "",
  nameAr: "",
  descEn: "",
  descAr: "",
  roomType: "DBL Room",
  priceFormula: "add",
  priceMethod: "percentage",
  pricePercent: 0,
  amenities: [],
  capacityOptions: [{ adults: 2, children: 0, childConfigs: [] }],
  bedOptionSets: [{ singleBed: 0, extraDoubleBed: 0, extraLargeBed: 0, otherBeds: [] }],
  priceDiffs: {},
  mainImage: null,
  gallery: [],
};

// Resize image to max 800x600 at 0.8 quality and return base64
function resizeImage(file, maxW = 800, maxH = 600, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas
          .getContext("2d")
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function RoomTypesPage() {
  const { lang } = useLanguage();
  const t = TXT[lang] || TXT.ar;
  const dir = lang === "en" ? "ltr" : "rtl";

  const [groups] = useLocalStorage("travky_guest_groups", INITIAL_GROUPS);
  const [periods] = useLocalStorage("travky_periods", INITIAL_PERIODS);
  const [supplements] = useLocalStorage("travky_supplements", []);
  const [roomTypes, setRoomTypes] = useLocalStorage(
    "travky_room_types",
    INITIAL_ROOM_TYPES,
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [langTab, setLangTab] = useState("en");
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBaseTarget, setDeleteBaseTarget] = useState(null);

  const mainImageRef = useRef(null);
  const galleryRef = useRef(null);

  const filtered = roomTypes.filter(
    (r) =>
      r.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      r.nameAr.includes(search) ||
      r.code.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    const priceDiffs = {};
    periods.forEach((p) => {
      priceDiffs[p.id] = {};
      groups.forEach((g) => {
        priceDiffs[p.id][g.id] = 0;
      });
    });
    setForm({ ...EMPTY_FORM, priceDiffs });
    setStep(1);
    setErrors({});
    setModal("add");
  }

  function openEdit(room) {
    const priceDiffs = {};
    periods.forEach((p) => {
      priceDiffs[p.id] = {};
      groups.forEach((g) => {
        priceDiffs[p.id][g.id] = room.priceDiffs?.[p.id]?.[g.id] ?? 0;
      });
    });
    setForm({
      code: room.code,
      nameEn: room.nameEn,
      nameAr: room.nameAr,
      descEn: room.descEn,
      descAr: room.descAr,
      roomType: room.roomType,
      priceFormula: room.priceFormula || "add",
      priceMethod: room.priceMethod || "percentage",
      pricePercent: room.pricePercent ?? 0,
      amenities: [...room.amenities],
      capacityOptions: room.capacityOptions.map((c) => ({
        ...c,
        childConfigs: c.childConfigs
          ? c.childConfigs.map((cc) => ({ ...cc }))
          : Array.from({ length: c.children || 0 }, () => ({ type: "Infant", priceType: "Free", amount: 0 })),
      })),
      bedOptionSets: room.bedOptionSets
        ? room.bedOptionSets.map((s) => ({ ...s, otherBeds: (s.otherBeds || []).map((b) => ({ ...b, prices: { ...b.prices } })) }))
        : [{ singleBed: room.beds?.singleBed || 0, extraDoubleBed: room.beds?.extraDoubleBed || 0, extraLargeBed: room.beds?.extraLargeBed || 0, otherBeds: (room.bedOptions || []).map((b) => ({ ...b, prices: { ...b.prices } })) }],
      priceDiffs,
      mainImage: room.mainImage || null,
      gallery: room.gallery ? [...room.gallery] : [],
    });
    setStep(1);
    setErrors({});
    setModal({ mode: "edit", data: room });
  }

  function closeModal() {
    setModal(null);
    setErrors({});
  }

  function toggleAmenity(a) {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));
  }

  function updateCapacity(idx, field, delta) {
    setForm((p) => {
      const opts = p.capacityOptions.map((c, i) => {
        if (i !== idx) return c;
        const newVal = Math.max(0, c[field] + delta);
        const updated = { ...c, [field]: newVal };
        // sync childConfigs array length with children count
        if (field === "children") {
          const cur = updated.childConfigs || [];
          if (newVal > cur.length) {
            updated.childConfigs = [
              ...cur,
              ...Array.from({ length: newVal - cur.length }, () => ({
                type: "Infant",
                priceType: "Free",
                amount: 0,
              })),
            ];
          } else {
            updated.childConfigs = cur.slice(0, newVal);
          }
        }
        return updated;
      });
      return { ...p, capacityOptions: opts };
    });
  }

  function addCapacityOption() {
    setForm((p) => ({
      ...p,
      capacityOptions: [
        ...p.capacityOptions,
        { adults: 1, children: 0, childConfigs: [] },
      ],
    }));
  }

  function removeCapacityOption(idx) {
    setForm((p) => ({
      ...p,
      capacityOptions: p.capacityOptions.filter((_, i) => i !== idx),
    }));
  }

  function addBedOptionSet() {
    setForm((p) => ({
      ...p,
      bedOptionSets: [...(p.bedOptionSets || []), { singleBed: 0, extraDoubleBed: 0, extraLargeBed: 0, otherBeds: [] }],
    }));
  }

  function removeBedOptionSet(setIdx) {
    setForm((p) => ({
      ...p,
      bedOptionSets: (p.bedOptionSets || []).filter((_, i) => i !== setIdx),
    }));
  }

  function updateBedSetCount(setIdx, key, delta) {
    setForm((p) => ({
      ...p,
      bedOptionSets: (p.bedOptionSets || []).map((s, i) =>
        i === setIdx ? { ...s, [key]: Math.max(0, (s[key] || 0) + delta) } : s,
      ),
    }));
  }

  function addOtherBed(setIdx) {
    const prices = {};
    groups.forEach((g) => { prices[g.id] = 0; });
    setForm((p) => ({
      ...p,
      bedOptionSets: (p.bedOptionSets || []).map((s, i) =>
        i === setIdx ? { ...s, otherBeds: [...(s.otherBeds || []), { name: "", type: "Free", count: 1, prices }] } : s,
      ),
    }));
  }

  function removeOtherBed(setIdx, bedIdx) {
    setForm((p) => ({
      ...p,
      bedOptionSets: (p.bedOptionSets || []).map((s, i) =>
        i === setIdx ? { ...s, otherBeds: (s.otherBeds || []).filter((_, j) => j !== bedIdx) } : s,
      ),
    }));
  }

  function updateOtherBed(setIdx, bedIdx, field, value) {
    setForm((p) => ({
      ...p,
      bedOptionSets: (p.bedOptionSets || []).map((s, i) =>
        i === setIdx
          ? { ...s, otherBeds: (s.otherBeds || []).map((b, j) => j === bedIdx ? { ...b, [field]: value } : b) }
          : s,
      ),
    }));
  }

  function setOtherBedPrice(setIdx, bedIdx, groupId, value) {
    setForm((p) => ({
      ...p,
      bedOptionSets: (p.bedOptionSets || []).map((s, i) =>
        i === setIdx
          ? { ...s, otherBeds: (s.otherBeds || []).map((b, j) => j === bedIdx ? { ...b, prices: { ...b.prices, [groupId]: Number(value) } } : b) }
          : s,
      ),
    }));
  }


  function setPriceDiff(periodId, groupId, val) {
    setForm((p) => ({
      ...p,
      priceDiffs: {
        ...p.priceDiffs,
        [periodId]: { ...p.priceDiffs[periodId], [groupId]: Number(val) },
      },
    }));
  }

  async function handleMainImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImage(file);
    setForm((p) => ({ ...p, mainImage: b64 }));
  }

  async function handleGalleryChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = await Promise.all(files.map((f) => resizeImage(f)));
    setForm((p) => ({ ...p, gallery: [...(p.gallery || []), ...newImages] }));
  }

  function removeGalleryImage(idx) {
    setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
  }

  function validateStep() {
    const errs = {};
    if (step === 1) {
      if (!form.nameEn.trim()) errs.nameEn = "Room name (EN) is required";
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSave() {
    const isFirstBase = modal === "add" && !roomTypes.some((r) => r.isBase);
    const data = { ...form, id: Date.now().toString(), isBase: isFirstBase || false };
    if (modal === "add") {
      setRoomTypes((prev) => [...prev, data]);
    } else if (modal?.mode === "edit") {
      setRoomTypes((prev) =>
        prev.map((r) =>
          r.id === modal.data.id ? { ...data, id: r.id, isBase: r.isBase } : r,
        ),
      );
    }
    closeModal();
  }

  return (
    <div className="page-shell" dir={dir}>
      {/* Regular delete confirm */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setRoomTypes((prev) => prev.filter((r) => r.id !== deleteTarget));
          setDeleteTarget(null);
        }}
      />

      {/* Base room delete warning modal */}
      {deleteBaseTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
            dir="rtl"
          >
            {/* Trash icon */}
            <div
              className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <Trash2 size={28} style={{ color: "#ef4444" }} />
            </div>

            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              {t.deleteBaseTitle}
            </h2>

            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              {t.deleteBaseMsg}
            </p>

            {/* Warning badge */}
            <div
              className="rounded-xl px-4 py-3 text-sm font-semibold mb-6"
              style={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
                color: "#92400e",
              }}
            >
              ⚠️ {t.deleteBaseWarning ? `${roomTypes.length} ${t.deleteBaseWarning}` : `سيتم حذف ${roomTypes.length} غرفة نهائياً`}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRoomTypes([]);
                  setDeleteBaseTarget(null);
                }}
                className="flex-1 py-3 rounded-xl text-base font-bold text-white transition-colors"
                style={{ backgroundColor: "#ef4444" }}
              >
                {t.deleteAll}
              </button>
              <button
                onClick={() => setDeleteBaseTarget(null)}
                className="flex-1 py-3 rounded-xl text-base font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--bg-raised)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center"
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <DoorOpen size={22} style={{ color: "#059669" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {t.pageTitle}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t.pageSubtitle}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          <Plus size={15} />
          <span>{t.add}</span>
        </button>
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl px-4 py-3 text-sm font-medium"
        style={{
          backgroundColor: "var(--bg-raised)",
          border: "1px solid var(--border)",
          color: "var(--sidebar-active-text)",
        }}
      >
        {t.dblInfo}
      </div>

      {/* Search */}
      <div className="flex justify-center">
        <div
          className="relative w-full max-w-lg rounded-2xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ right: "1rem", color: "var(--text-muted)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent outline-none py-3 px-4 text-sm"
            style={{ paddingInlineEnd: "2.8rem", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div
            className="col-span-full py-16 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {t.noRooms}
          </div>
        ) : (
          filtered.flatMap((room) => [
            <RoomCard
              key={room.id}
              room={room}
              supplement={null}
              lang={lang}
              t={t}
              onEdit={() => openEdit(room)}
              onView={() => setViewItem(room)}
              onToggleHide={() => setRoomTypes((prev) => prev.map((r) => r.id === room.id ? { ...r, isHidden: !r.isHidden } : r))}
              onDelete={() =>
                room.isBase
                  ? setDeleteBaseTarget(room.id)
                  : setDeleteTarget(room.id)
              }
            />,
            ...supplements.map((supp) => (
              <RoomCard
                key={`${room.id}-${supp.id}`}
                room={room}
                supplement={supp}
                lang={lang}
                t={t}
                onEdit={() => openEdit(room)}
                onView={() => setViewItem(room)}
                onToggleHide={() => setRoomTypes((prev) => prev.map((r) => r.id === room.id ? { ...r, isHidden: !r.isHidden } : r))}
                onDelete={() =>
                  room.isBase
                    ? setDeleteBaseTarget(room.id)
                    : setDeleteTarget(room.id)
                }
              />
            )),
          ])
        )}
      </div>

      {/* View Modal */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setViewItem(null)}
                className="h-7 w-7 grid place-items-center rounded-lg"
                style={{
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-raised)",
                }}
              >
                <X size={16} />
              </button>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {t.roomDetails}
              </h2>
            </div>
            {viewItem.mainImage && (
              <img
                src={viewItem.mainImage}
                alt={viewItem.nameEn}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <div className="space-y-3">
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t.nameArLabel}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {viewItem.nameAr}
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t.nameEnLabel}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {viewItem.nameEn}
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t.codeLabel}
                </p>
                <span className="chip">{viewItem.code}</span>
              </div>
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t.roomTypeLabel}
                </p>
                <span className="chip">{viewItem.roomType}</span>
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t.amenitiesLabel}
                </p>
                <div className="flex flex-wrap gap-1">
                  {viewItem.amenities.map((a) => {
                    const AmenityIcon = AMENITY_ICON_MAP[a];
                    return (
                      <span key={a} className="chip text-xs inline-flex items-center gap-1">
                        {AmenityIcon && <AmenityIcon size={12} />}
                        {a}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t.capacityLabel}
                </p>
                {viewItem.capacityOptions.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-1.5 px-3 rounded-lg mb-1.5"
                    style={{ backgroundColor: "var(--bg-raised)" }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t.optionLabel} {i + 1}
                    </span>
                    <span className="text-sm font-medium">{c.adults} {t.adultLabel}</span>
                    <span className="text-sm font-medium">
                      {c.children} {t.childLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setViewItem(null)}
              className="btn btn-secondary w-full mt-4"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-lg lg:max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl p-6 lg:p-8 shadow-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={closeModal}
                className="h-7 w-7 grid place-items-center rounded-lg"
                style={{
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-raised)",
                }}
              >
                <X size={16} />
              </button>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {modal === "add" ? t.addRoomTitle : t.editRoomTitle} —{" "}
                {(t.stepTitles || STEP_TITLES)[step - 1]}
              </h2>
            </div>

            <StepIndicator step={step} total={4} />

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="lg:grid lg:grid-cols-2 lg:gap-8" dir="rtl">
                {/* ── Left column: language toggle + name + description ── */}
                <div className="space-y-5">
                  {/* Language toggle */}
                  <div className="flex items-center gap-2">
                    {[
                      { v: "en", flag: "us", label: "EN" },
                      { v: "ar", flag: "eg", label: "AR" },
                    ].map((l) => (
                      <button
                        key={l.v}
                        type="button"
                        onClick={() => setLangTab(l.v)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold transition-all"
                        style={
                          langTab === l.v
                            ? {
                                backgroundColor: "var(--sidebar-active-text)",
                                color: "#fff",
                              }
                            : {
                                backgroundColor: "var(--bg-raised)",
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border)",
                              }
                        }
                      >
                        <img
                          src={`https://flagcdn.com/w20/${l.flag}.png`}
                          alt={l.label}
                          className="h-3.5 w-5 rounded object-cover"
                        />
                        {l.label}
                      </button>
                    ))}
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.nameLabel}
                    </label>
                    {langTab === "en" ? (
                      <input
                        value={form.nameEn}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, nameEn: e.target.value }))
                        }
                        className="input w-full"
                        style={{ textAlign: "right" }}
                        placeholder="Room name in English"
                      />
                    ) : (
                      <input
                        value={form.nameAr}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, nameAr: e.target.value }))
                        }
                        className="input w-full"
                        placeholder="اسم الغرفة بالعربية"
                      />
                    )}
                    {errors.nameEn && (
                      <p className="input-error mt-1">{errors.nameEn}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.descLabel}
                    </label>
                    {langTab === "en" ? (
                      <textarea
                        value={form.descEn}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, descEn: e.target.value }))
                        }
                        className="input w-full h-36 resize-none"
                        style={{ textAlign: "right" }}
                        placeholder="Description in English"
                      />
                    ) : (
                      <textarea
                        value={form.descAr}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, descAr: e.target.value }))
                        }
                        className="input w-full h-36 resize-none"
                        placeholder="الوصف بالعربية"
                      />
                    )}
                  </div>
                </div>

                {/* ── Right column: room type + price formula + amenities ── */}
                <div className="space-y-5 mt-5 lg:mt-0">
                  {/* Room Type */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.roomTypeFormLabel}
                    </label>
                    <select
                      value={form.roomType}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, roomType: e.target.value }))
                      }
                      className="input w-full"
                      style={{ textAlign: "right", direction: "rtl" }}
                      disabled={!roomTypes.some((r) => r.isBase)}
                    >
                      {ROOM_TYPES_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Formula — only shown for non-base rooms (when a base DBL already exists) */}
                  {roomTypes.some((r) => r.isBase) && (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                      {/* Direction picker */}
                      <div className="relative">
                        <select
                          value={form.priceFormula}
                          onChange={(e) => setForm((p) => ({ ...p, priceFormula: e.target.value }))}
                          className="w-full bg-transparent outline-none py-3 px-4 text-sm font-semibold appearance-none cursor-pointer"
                          style={{
                            direction: "rtl",
                            paddingInlineEnd: "2.5rem",
                            paddingInlineStart: "1rem",
                            color: form.priceFormula === "less" ? "var(--danger)" : "var(--sidebar-active-text)",
                            border: `1.5px solid ${form.priceFormula === "less" ? "var(--danger)" : "var(--sidebar-active-text)"}`,
                            borderRadius: "0.75rem",
                          }}
                        >
                          {PRICE_FORMULA_DIRECTIONS.map((d) => (
                            <option key={d.value} value={d.value}>{t[d.labelKey]}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ insetInlineStart: "0.85rem", color: form.priceFormula === "less" ? "var(--danger)" : "var(--sidebar-active-text)" }}
                        />
                      </div>

                      {/* Method toggle + value */}
                      <div className="px-3 pt-3 pb-3 space-y-3" style={{ backgroundColor: "var(--bg-raised)" }}>
                        {/* Toggle */}
                        <div className="flex gap-1.5">
                          {[
                            { value: "fixed", labelKey: "priceMethodFixed" },
                            { value: "percentage", labelKey: "priceMethodPct" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, priceMethod: opt.value }))}
                              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                              style={
                                form.priceMethod === opt.value
                                  ? { backgroundColor: "var(--sidebar-active-text)", color: "white" }
                                  : { backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                              }
                            >
                              {t[opt.labelKey]}
                            </button>
                          ))}
                        </div>

                        {/* Percentage slider */}
                        {form.priceMethod === "percentage" && (
                          <div dir="ltr">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                              >
                                {form.pricePercent}%
                              </span>
                              <span
                                className="text-xs font-semibold"
                                style={{ color: form.priceFormula === "less" ? "var(--danger)" : "var(--sidebar-active-text)" }}
                              >
                                {form.priceFormula === "less" ? t.pctSubtract : t.pctAdd}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={form.pricePercent}
                              onChange={(e) => setForm((p) => ({ ...p, pricePercent: Number(e.target.value) }))}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amenities — 2-column card grid */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.roomAmenities}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AMENITIES.map(({ label, Icon: AmenityIcon }) => {
                        const selected = form.amenities.includes(label);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleAmenity(label)}
                            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                              backgroundColor: "var(--bg-surface)",
                              border: selected
                                ? "1.5px solid var(--sidebar-active-text)"
                                : "1.5px solid var(--border)",
                              color: "var(--text-primary)",
                            }}
                          >
                            <CheckCircle2
                              size={18}
                              style={{
                                color: selected
                                  ? "var(--sidebar-active-text)"
                                  : "var(--border)",
                                flexShrink: 0,
                              }}
                            />
                            <span>{label}</span>
                            <AmenityIcon
                              size={17}
                              style={{
                                color: selected
                                  ? "var(--sidebar-active-text)"
                                  : "var(--text-muted)",
                                flexShrink: 0,
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Images */}
            {step === 2 && (
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.mainImageLabel}
                  </label>
                  <input
                    ref={mainImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainImageChange}
                  />
                  {form.mainImage ? (
                    <div className="relative rounded-xl overflow-hidden h-44">
                      <img
                        src={form.mainImage}
                        alt="main"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, mainImage: null }))
                        }
                        className="absolute top-2 left-2 h-7 w-7 rounded-full grid place-items-center bg-black/50 text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => mainImageRef.current?.click()}
                      className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center h-36 cursor-pointer transition-colors hover:opacity-80"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--bg-raised)",
                      }}
                    >
                      <DoorOpen
                        size={24}
                        style={{ color: "var(--text-muted)" }}
                      />
                      <p
                        className="mt-2 text-sm font-medium"
                        style={{ color: "var(--sidebar-active-text)" }}
                      >
                        {t.clickToUpload}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.galleryLabel}
                  </label>
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryChange}
                  />
                  {(form.gallery || []).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {form.gallery.map((img, i) => (
                        <div
                          key={i}
                          className="relative rounded-lg overflow-hidden aspect-square"
                        >
                          <img
                            src={img}
                            alt={`gallery-${i}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            className="absolute top-1 left-1 h-6 w-6 rounded-full grid place-items-center bg-black/50 text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    onClick={() => galleryRef.current?.click()}
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center h-28 cursor-pointer transition-colors hover:opacity-80"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-raised)",
                    }}
                  >
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {t.dragOrClick}
                    </p>
                    <p
                      className="mt-1.5 text-sm font-medium"
                      style={{ color: "var(--sidebar-active-text)" }}
                    >
                      {t.uploadPhotos}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Capacity */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {form.capacityOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                      {t.capacityOption} {idx + 1}
                      </p>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span>Adult {opt.adults}</span>
                        <span className="mx-2">·</span>
                        <span>Children {opt.children}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Adult",
                          icon: <Users size={18} />,
                          field: "adults",
                        },
                        {
                          label: "Children",
                          icon: <Baby size={18} />,
                          field: "children",
                        },
                      ].map(({ label, icon, field }) => (
                        <div
                          key={field}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div
                            className="flex items-center gap-2"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {icon}
                            <span className="text-sm">{label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateCapacity(idx, field, -1)}
                              className="w-8 h-8 rounded-full grid place-items-center font-bold transition-colors text-white"
                              style={{
                                backgroundColor: "var(--sidebar-active-text)",
                              }}
                            >
                              —
                            </button>
                            <span
                              className="w-6 text-center font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {opt[field]}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCapacity(idx, field, 1)}
                              className="w-8 h-8 rounded-full grid place-items-center font-bold transition-colors text-white text-xl"
                              style={{
                                backgroundColor: "var(--sidebar-active-text)",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Per-child configuration rows */}
                    {opt.children > 0 && (
                      <div className="mt-4 space-y-2" dir="rtl">
                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                          {t.childSettings}
                        </p>
                        {(opt.childConfigs || []).map((cfg, ci) => {
                          function updateChildCfg(patch) {
                            setForm((p) => ({
                              ...p,
                              capacityOptions: p.capacityOptions.map((o, oi) => {
                                if (oi !== idx) return o;
                                return {
                                  ...o,
                                  childConfigs: o.childConfigs.map((cc, cii) =>
                                    cii === ci ? { ...cc, ...patch } : cc,
                                  ),
                                };
                              }),
                            }));
                          }
                          return (
                            <div key={ci} className="space-y-2">
                              {/* Price type + Child type row */}
                              <div className="grid grid-cols-2 gap-2">
                                {/* Price type select */}
                                <div className="flex items-center px-3 py-2.5 rounded-xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                                  <select
                                    value={cfg.priceType}
                                    onChange={(e) => updateChildCfg({ priceType: e.target.value, amount: 0, groupPrices: {} })}
                                    className="bg-transparent outline-none text-sm w-full"
                                    style={{ color: "var(--sidebar-active-text)", fontWeight: 600 }}
                                  >
                                    {CHILD_PRICE_TYPES.map((pt) => (
                                      <option key={pt} value={pt}>{pt}</option>
                                    ))}
                                  </select>
                                </div>
                                {/* Child age type select */}
                                <div className="flex items-center px-3 py-2.5 rounded-xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                                  <select
                                    value={cfg.type}
                                    onChange={(e) => updateChildCfg({ type: e.target.value })}
                                    className="bg-transparent outline-none text-sm w-full"
                                    style={{ color: "#f59e0b", fontWeight: 600 }}
                                  >
                                    {CHILD_TYPES.map((ct) => (
                                      <option key={ct} value={ct}>{ct}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Fixed Amount: per-group prices */}
                              {cfg.priceType === "Fixed Amount" && (
                                <div className="rounded-xl px-3 py-3 space-y-2" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                                  <p className="text-xs font-semibold text-right" style={{ color: "var(--text-secondary)" }}>(-/+) Price difference per group</p>
                                  {groups.map((g) => (
                                    <div key={g.id} className="flex items-center justify-between gap-2">
                                      <input
                                        type="number"
                                        value={cfg.groupPrices?.[g.id] ?? 0}
                                        onChange={(e) => updateChildCfg({ groupPrices: { ...(cfg.groupPrices || {}), [g.id]: Number(e.target.value) } })}
                                        className="input"
                                        style={{ width: "5rem", flexShrink: 0 }}
                                      />
                                      <span className="text-xs font-bold text-right" style={{ color: "var(--text-secondary)" }}>
                                        {g.name.toUpperCase()} <span style={{ color: "var(--sidebar-active-text)" }}>({g.currency})</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Fixed Percent: percentage slider */}
                              {cfg.priceType === "Fixed Percent" && (
                                <div className="rounded-xl px-3 py-3" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <input
                                      type="range"
                                      min={0} max={100} step={1}
                                      value={cfg.amount ?? 0}
                                      onChange={(e) => updateChildCfg({ amount: Number(e.target.value) })}
                                      className="flex-1"
                                      style={{ accentColor: "var(--sidebar-active-text)" }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>% Percentage</span>
                                    <span className="text-sm font-bold" style={{ color: "var(--sidebar-active-text)" }}>{cfg.amount ?? 0}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => removeCapacityOption(idx)}
                        className="mt-3 text-xs"
                        style={{ color: "var(--danger)" }}
                      >
                        {t.removeOption}
                      </button>
                    )}
                  </div>
                ))}
                </div>
                <button
                  type="button"
                  onClick={addCapacityOption}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border-2 border-dashed transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t.addCapacityOption}
                </button>
              </div>
            )}

            {/* Step 4: Beds & Prices */}
            {step === 4 && (
              <div className="space-y-4">
                {/* ── Bed Option Set cards ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(form.bedOptionSets || []).map((bSet, setIdx) => (
                  <div
                    key={setIdx}
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    {/* Dark header */}
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ backgroundColor: "#1e3a5f" }}
                    >
                      {(form.bedOptionSets || []).length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeBedOptionSet(setIdx)}
                          className="w-6 h-6 grid place-items-center rounded"
                          style={{ color: "white", opacity: 0.7 }}
                        >
                          <X size={14} />
                        </button>
                      ) : (
                        <span style={{ width: 24 }} />
                      )}
                      <span className="text-sm font-bold text-white">
                        {t.bedOptions} {setIdx + 1}
                      </span>
                    </div>

                    {/* Bed rows body */}
                    <div
                      className="px-4 py-3 space-y-4"
                      style={{ backgroundColor: "var(--bg-raised)" }}
                    >
                      {/* Standard bed rows */}
                      {BED_TYPES.map(({ key, labelKey, Icon }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateBedSetCount(setIdx, key, 1)}
                              className="w-8 h-8 rounded-full grid place-items-center font-bold text-white text-xl"
                              style={{ backgroundColor: "var(--sidebar-active-text)" }}
                            >+</button>
                            <span className="w-6 text-center font-semibold" style={{ color: "var(--text-primary)" }}>
                              {bSet[key] || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateBedSetCount(setIdx, key, -1)}
                              className="w-8 h-8 rounded-full grid place-items-center font-bold"
                              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            >—</button>
                          </div>
                          <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                            <span className="text-sm font-medium">{t[labelKey]}</span>
                            <Icon size={18} />
                          </div>
                        </div>
                      ))}

                      {/* Other summary row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => addOtherBed(setIdx)}
                            className="w-8 h-8 rounded-full grid place-items-center font-bold text-white text-xl"
                            style={{ backgroundColor: "var(--sidebar-active-text)" }}
                          >+</button>
                          <span className="w-6 text-center font-semibold" style={{ color: "var(--text-primary)" }}>
                            {(bSet.otherBeds || []).length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const len = (bSet.otherBeds || []).length;
                              if (len > 0) removeOtherBed(setIdx, len - 1);
                            }}
                            className="w-8 h-8 rounded-full grid place-items-center font-bold"
                            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                          >—</button>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                          <span className="text-sm font-medium">{t.otherBeds}</span>
                          <button
                            type="button"
                            onClick={() => addOtherBed(setIdx)}
                            className="w-6 h-6 rounded-full grid place-items-center text-sm font-bold border"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-surface)" }}
                          >+</button>
                        </div>
                      </div>

                      {/* Inline "Other" bed entries */}
                      {(bSet.otherBeds || []).map((opt, bedIdx) => (
                        <div key={bedIdx} className="space-y-2">
                          {/* Row: + count − | Other [+] */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateOtherBed(setIdx, bedIdx, "count", (opt.count || 1) + 1)}
                                className="w-8 h-8 rounded-full grid place-items-center font-bold text-white text-xl"
                                style={{ backgroundColor: "var(--sidebar-active-text)" }}
                              >+</button>
                              <span className="w-6 text-center font-semibold" style={{ color: "var(--text-primary)" }}>
                                {opt.count || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateOtherBed(setIdx, bedIdx, "count", Math.max(1, (opt.count || 1) - 1))}
                                className="w-8 h-8 rounded-full grid place-items-center font-bold"
                                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                              >—</button>
                            </div>
                            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                              <span className="text-sm font-medium">{t.otherBeds}</span>
                              <button
                                type="button"
                                onClick={() => addOtherBed(setIdx)}
                                className="w-6 h-6 rounded-full grid place-items-center text-sm font-bold border"
                                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-surface)" }}
                              >+</button>
                            </div>
                          </div>

                          {/* Expanded config box */}
                          <div
                            className="rounded-xl p-3 space-y-2"
                            style={{ backgroundColor: "var(--bg-surface)", border: `1.5px solid ${opt.type === "Fixed" ? "var(--sidebar-active-text)" : "var(--border)"}` }}
                          >
                            <div className="grid grid-cols-2 gap-2">
                              {/* Type dropdown */}
                              <div
                                className="flex items-center gap-1 px-3 py-2.5 rounded-xl"
                                style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)" }}
                              >
                                <ChevronDown size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                <select
                                  value={opt.type}
                                  onChange={(e) => updateOtherBed(setIdx, bedIdx, "type", e.target.value)}
                                  className="bg-transparent outline-none text-sm w-full"
                                  style={{ color: opt.type === "Fixed" ? "var(--sidebar-active-text)" : "var(--text-secondary)", fontWeight: 600 }}
                                >
                                  <option value="Free">Free</option>
                                  <option value="Fixed">Fixed</option>
                                </select>
                              </div>
                              {/* Bed name input */}
                              <input
                                type="text"
                                value={opt.name}
                                onChange={(e) => updateOtherBed(setIdx, bedIdx, "name", e.target.value)}
                                placeholder={t.bedNamePlaceholder}
                                className="input text-right"
                              />
                            </div>

                            {/* Per-group prices when Fixed */}
                            {opt.type === "Fixed" && (
                              <div className="pt-1 space-y-2">
                                <p className="text-xs font-semibold text-right" style={{ color: "var(--text-secondary)" }}>
                                  {t.priceDiffPerGroup}
                                </p>
                                {groups.map((g) => (
                                  <div key={g.id} className="flex items-center justify-between gap-2">
                                    <input
                                      type="number"
                                      value={opt.prices?.[g.id] ?? 0}
                                      onChange={(e) => setOtherBedPrice(setIdx, bedIdx, g.id, e.target.value)}
                                      className="input"
                                      style={{ width: "5.5rem", flexShrink: 0 }}
                                    />
                                    <span className="text-xs font-bold text-right" style={{ color: "var(--text-secondary)" }}>
                                      {g.name.toUpperCase()}{" "}
                                      <span style={{ color: "var(--sidebar-active-text)" }}>({g.currency})</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                </div>

                {/* Add Bed Option button */}
                <button
                  type="button"
                  onClick={addBedOptionSet}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ border: "1.5px dashed var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-surface)" }}
                >
                  {t.addBedOption}&nbsp;<span className="text-lg leading-none">+</span>
                </button>
              </div>
            )}

            {/* Navigation */}
            <div
              className="flex items-center justify-between mt-6 pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="btn btn-secondary flex items-center gap-1.5"
                >
                  <ChevronRight size={16} />
                  <span>{t.back}</span>
                </button>
              ) : (
                <button onClick={closeModal} className="btn btn-secondary">
                  {t.cancel}
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="btn text-white flex items-center gap-1.5"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  <span>{(t.stepTitles || STEP_TITLES)[step]}</span>
                  <ChevronLeft size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="btn text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  {t.save}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BedPopup({ bedSets, t, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 bottom-[calc(100%+6px)] right-0 rounded-2xl shadow-xl py-3 px-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          minWidth: 220,
        }}
      >
        <p className="text-sm font-bold mb-3 text-end" style={{ color: "var(--text-primary)" }}>
          {t.bedOptions}
        </p>
        <div className="space-y-3">
          {bedSets.map((set, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-end">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  {t.optionLabel} {idx + 1}
                </span>
              </div>
              {(set.otherBeds || []).length === 0 && (
                <p className="text-xs text-end" style={{ color: "var(--text-muted)" }}>—</p>
              )}
              {(set.otherBeds || []).map((bed, bIdx) => (
                <div key={bIdx} className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: bed.priceType === "Free" ? "#22c55e" : "#f59e0b" }}
                  >
                    {bed.priceType === "Free" ? t.free : t.paid}
                  </span>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{bed.name}</span>
                    <BedDouble size={12} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CapPopup({ capOpts, t, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 bottom-[calc(100%+6px)] right-0 rounded-2xl shadow-xl py-3 px-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          minWidth: 240,
        }}
      >
        <p className="text-sm font-bold mb-3 text-end" style={{ color: "var(--text-primary)" }}>
          {t.capOptionsTitle}
        </p>
        <div className="space-y-3">
          {capOpts.map((opt, idx) => (
            <div
              key={idx}
              className="space-y-1.5 pb-2"
              style={{ borderBottom: idx < capOpts.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <Smile size={12} />
                  <span>{opt.adults ?? 0}</span>
                  <span>+</span>
                  <span>{opt.children ?? 0}</span>
                  <Users size={11} />
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "var(--sidebar-active-text)" }}
                >
                  {t.optionLabel} {idx + 1}
                </span>
              </div>
              {(opt.childConfigs || []).map((cfg, cIdx) => (
                <div key={cIdx} className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: cfg.priceType === "Free" ? "#22c55e" : "#f59e0b" }}
                  >
                    {cfg.priceType === "Free" ? t.free : t.paid}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {cfg.type}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RoomCard({ room, supplement, onEdit, onView, onDelete, onToggleHide, lang, t }) {
  const [activePop, setActivePop] = useState(null); // "bed" | "cap" | null

  const cardTitle = supplement
    ? `${lang === "ar" ? room.nameAr : room.nameEn} — ${supplement.name}`
    : lang === "ar" ? room.nameAr : room.nameEn;

  const bedSets = room.bedOptionSets || [];
  const firstSet = bedSets[0] || {};
  const firstOtherBed = (firstSet.otherBeds || [])[0];

  const capOpts = room.capacityOptions || [];
  const firstCap = capOpts[0] || {};

  const amenities = room.amenities || [];
  const MAX_SHOWN = 6;
  const shownAmenities = amenities.slice(0, MAX_SHOWN);
  const overflowCount = amenities.length - MAX_SHOWN;

  return (
    <div
      className="rounded-2xl"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image */}
      <div className="relative rounded-t-2xl overflow-hidden" style={{ height: 168 }}>
        {room.mainImage ? (
          <img src={room.mainImage} alt={cardTitle} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-raised)" }}
          >
            <DoorOpen size={44} style={{ color: "var(--border)", opacity: 0.5 }} />
          </div>
        )}

        {/* Hidden overlay */}
        {room.isHidden && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <EyeOff size={32} color="white" />
          </div>
        )}

        {/* Action buttons — top left */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full grid place-items-center bg-white shadow"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onToggleHide}
            className="w-8 h-8 rounded-full grid place-items-center bg-white shadow"
            style={{ color: room.isHidden ? "#6366f1" : "#94a3b8" }}
          >
            <EyeOff size={14} />
          </button>
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-full grid place-items-center bg-white shadow"
            style={{ color: "#f59e0b" }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onView}
            className="w-8 h-8 rounded-full grid place-items-center bg-white shadow"
            style={{ color: "#3b82f6" }}
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Code + room type — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: room.isBase ? "var(--sidebar-active-text)" : "#334155" }}
          >
            {room.code}
          </span>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white"
            style={{ color: "var(--text-secondary)" }}
          >
            {room.roomType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-3 space-y-3">
        {/* Room name */}
        <h3 className="text-sm font-bold text-end" style={{ color: "var(--text-primary)" }}>
          {cardTitle}
        </h3>

        {/* Pills row */}
        <div className="flex items-center gap-2">
          {/* Left pill — bed options */}
          <div className="relative flex-1">
            <button
              onClick={() => setActivePop(activePop === "bed" ? null : "bed")}
              className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <Layers size={11} />
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {bedSets.length}
              </span>
              {firstOtherBed && (
                <span className="truncate" style={{ maxWidth: "4rem" }}>{firstOtherBed.name}</span>
              )}
              <BedDouble size={13} />
            </button>
            {activePop === "bed" && (
              <BedPopup bedSets={bedSets} t={t} onClose={() => setActivePop(null)} />
            )}
          </div>

          {/* Right pill — capacity options */}
          <div className="relative flex-1">
            <button
              onClick={() => setActivePop(activePop === "cap" ? null : "cap")}
              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <Layers size={11} />
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {capOpts.length}
              </span>
              <Smile size={12} />
              <span>{firstCap.adults ?? 0}</span>
              <span>+</span>
              <span>{firstCap.children ?? 0}</span>
              <Users size={11} />
            </button>
            {activePop === "cap" && (
              <CapPopup capOpts={capOpts} t={t} onClose={() => setActivePop(null)} />
            )}
          </div>
        </div>

        {/* Amenities strip */}
        {amenities.length > 0 && (
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1"
            dir="rtl"
            style={{ scrollbarWidth: "none" }}
          >
            {shownAmenities.map((a) => {
              const AmenityIcon = AMENITY_ICON_MAP[a];
              return (
                <span
                  key={a}
                  className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {AmenityIcon && <AmenityIcon size={11} />}
                  <span>{a}</span>
                </span>
              );
            })}
            {overflowCount > 0 && (
              <span
                className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                +{overflowCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
