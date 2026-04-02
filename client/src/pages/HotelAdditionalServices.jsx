import { useMemo, useState } from "react";
import {
  Baby,
  Box,
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import LoadingScreen from "../components/LoadingScreen";
import {
  useCreateHotelServiceMutation,
  useDeleteHotelServiceMutation,
  useGetChannelConfigQuery,
  useGetHotelServicesQuery,
  useUpdateHotelServiceMutation,
} from "../store/services/api";

const DEFAULT_GROUPS = [
  { id: "egypt", name: "egyptian market", currency: "EGP" },
  { id: "euro", name: "euro market", currency: "EUR" },
  { id: "syrian", name: "syrian", currency: "EGP" },
];

const SERVICE_OPTIONS = [
  { key: "airport_transfer", name: "Airport Transfer", nameAr: "نقل المطار" },
  { key: "late_checkout", name: "Late Check-out", nameAr: "تسجيل خروج متأخر" },
  { key: "early_checkin", name: "Early Check-in", nameAr: "تسجيل دخول مبكر" },
  { key: "room_upgrade", name: "Room Upgrade", nameAr: "ترقية الغرفة" },
  { key: "breakfast", name: "Breakfast", nameAr: "إفطار" },
  { key: "lunch", name: "Lunch", nameAr: "غداء" },
  { key: "dinner", name: "Dinner", nameAr: "عشاء" },
  { key: "spa", name: "Spa Service", nameAr: "خدمة سبا" },
  { key: "laundry", name: "Laundry Service", nameAr: "خدمة غسيل" },
  { key: "mini_bar", name: "Mini Bar", nameAr: "ميني بار" },
  { key: "parking", name: "Parking", nameAr: "موقف سيارات" },
  { key: "premium_wifi", name: "Premium Wi‑Fi", nameAr: "واي فاي متميز" },
  { key: "baby_crib", name: "Baby Crib", nameAr: "سرير أطفال" },
  { key: "extra_benefits", name: "Extra Benefits", nameAr: "منافع إضافية" },
];

const COPY = {
  en: {
    title: "Additional Services",
    subtitle: "Manage guest add-ons and per-person pricing.",
    add: "Add",
    addService: "Add Service",
    editService: "Edit Service",
    chooseService: "Choose Service",
    servicePlaceholder: "Choose a service...",
    pricingHint: "Prices per person",
    adult: "Adult",
    childTypes: "Child Types",
    addChild: "Add",
    save: "Save",
    update: "Update",
    fixed: "Fixed",
    free: "Free",
    childLabel: "Child",
    noServices: "No additional services yet.",
    deleteConfirm: "Delete this service?",
    adultsFixed: "Adult: Fixed",
    adultsFree: "Adult: Free",
    childTypesCount: "child type(s)",
  },
  ar: {
    title: "الخدمات الإضافية",
    subtitle: "إدارة الخدمات الإضافية للعملاء • السعر للفرد",
    add: "إضافة",
    addService: "إضافة خدمة",
    editService: "تعديل الخدمة",
    chooseService: "اختر الخدمة",
    servicePlaceholder: "اختر خدمة...",
    pricingHint: "الأسعار للفرد الواحد",
    adult: "Adult",
    childTypes: "أنواع الأطفال",
    addChild: "إضافة",
    save: "إضافة",
    update: "تحديث",
    fixed: "Fixed",
    free: "Free",
    childLabel: "Child",
    noServices: "لا توجد خدمات إضافية بعد.",
    deleteConfirm: "هل تريد حذف هذه الخدمة؟",
    adultsFixed: "Adult: Fixed",
    adultsFree: "Adult: Free",
    childTypesCount: "child type(s)",
  },
};

const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function buildPriceRows(groups, existing = []) {
  return groups.map((group) => {
    const matched = existing.find((item) => String(item.groupId) === String(group.id));
    return {
      groupId: String(group.id),
      groupName: matched?.groupName || group.name,
      currency: matched?.currency || group.currency || "EGP",
      amount: Number(matched?.amount || 0),
    };
  });
}

function createEmptyChild(groups) {
  return {
    id: makeId(),
    label: "Child",
    pricingType: "free",
    prices: buildPriceRows(groups),
  };
}

function createInitialForm(groups) {
  return {
    serviceKey: "",
    name: "",
    nameAr: "",
    pricingBasis: "per_person",
    adultPricingType: "free",
    adultPrices: buildPriceRows(groups),
    childTypes: [],
  };
}

function normalizeForm(form, groups) {
  return {
    ...form,
    adultPrices: buildPriceRows(groups, form.adultPrices || []),
    childTypes: (form.childTypes || []).map((child) => ({
      ...child,
      id: child.id || makeId(),
      prices: buildPriceRows(groups, child.prices || []),
    })),
  };
}

export default function HotelAdditionalServicesPage() {
  const { lang, dir } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const isRtl = dir === "rtl";

  const { data: services = [], isLoading } = useGetHotelServicesQuery();
  const { data: channelConfig } = useGetChannelConfigQuery();
  const [createHotelService, { isLoading: creating }] = useCreateHotelServiceMutation();
  const [updateHotelService, { isLoading: updating }] = useUpdateHotelServiceMutation();
  const [deleteHotelService] = useDeleteHotelServiceMutation();

  const guestGroups = useMemo(() => {
    const apiGroups = Array.isArray(channelConfig?.guestGroups) && channelConfig.guestGroups.length
      ? channelConfig.guestGroups
      : DEFAULT_GROUPS;

    return apiGroups.map((group) => ({
      id: String(group.id || group._id || makeId()),
      name: group.name || group.label || "market",
      currency: group.currency || "EGP",
    }));
  }, [channelConfig]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => createInitialForm(DEFAULT_GROUPS));

  const saving = creating || updating;

  const openAddModal = () => {
    setEditing(null);
    setError("");
    setForm(createInitialForm(guestGroups));
    setOpen(true);
  };

  const openEditModal = (service) => {
    setEditing(service);
    setError("");
    setForm(normalizeForm({
      serviceKey: service.serviceKey || "",
      name: service.name || "",
      nameAr: service.nameAr || "",
      pricingBasis: service.pricingBasis || "per_person",
      adultPricingType: service.adultPricingType || "free",
      adultPrices: service.adultPrices || [],
      childTypes: service.childTypes || [],
    }, guestGroups));
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setError("");
  };

  const handleServiceSelect = (serviceKey) => {
    const matched = SERVICE_OPTIONS.find((item) => item.key === serviceKey);
    setForm((prev) => ({
      ...prev,
      serviceKey,
      name: matched?.name || prev.name,
      nameAr: matched?.nameAr || prev.nameAr,
    }));
  };

  const setAdultPrice = (groupId, amount) => {
    setForm((prev) => ({
      ...prev,
      adultPrices: prev.adultPrices.map((row) =>
        String(row.groupId) === String(groupId)
          ? { ...row, amount: Number(amount || 0) }
          : row,
      ),
    }));
  };

  const addChildType = () => {
    setForm((prev) => ({
      ...prev,
      childTypes: [...prev.childTypes, createEmptyChild(guestGroups)],
    }));
  };

  const updateChildType = (childId, field, value) => {
    setForm((prev) => ({
      ...prev,
      childTypes: prev.childTypes.map((child) =>
        child.id === childId ? { ...child, [field]: value } : child,
      ),
    }));
  };

  const updateChildPrice = (childId, groupId, amount) => {
    setForm((prev) => ({
      ...prev,
      childTypes: prev.childTypes.map((child) => {
        if (child.id !== childId) return child;
        return {
          ...child,
          prices: child.prices.map((row) =>
            String(row.groupId) === String(groupId)
              ? { ...row, amount: Number(amount || 0) }
              : row,
          ),
        };
      }),
    }));
  };

  const removeChildType = (childId) => {
    setForm((prev) => ({
      ...prev,
      childTypes: prev.childTypes.filter((child) => child.id !== childId),
    }));
  };

  const handleSave = async () => {
    if (!form.serviceKey || !form.name.trim()) {
      setError(lang === "ar" ? "يرجى اختيار الخدمة أولاً." : "Please choose a service first.");
      return;
    }

    const payload = {
      serviceKey: form.serviceKey,
      name: form.name.trim(),
      nameAr: form.nameAr.trim(),
      pricingBasis: "per_person",
      adultPricingType: form.adultPricingType,
      adultPrices: buildPriceRows(guestGroups, form.adultPrices || []),
      childTypes: (form.childTypes || []).map((child) => ({
        ...child,
        label: child.label?.trim() || copy.childLabel,
        prices: buildPriceRows(guestGroups, child.prices || []),
      })),
    };

    try {
      if (editing?._id) {
        await updateHotelService({ _id: editing._id, ...payload }).unwrap();
      } else {
        await createHotelService(payload).unwrap();
      }
      closeModal();
    } catch (err) {
      setError(err?.data?.message || (lang === "ar" ? "تعذر حفظ الخدمة." : "Failed to save service."));
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(copy.deleteConfirm)) return;
    await deleteHotelService(service._id).unwrap();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start md:justify-between">
        <button
          onClick={openAddModal}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold text-white shadow-lg"
          style={{ backgroundColor: "#173f78", width: isRtl ? "fit-content" : undefined }}
        >
          <span>{copy.add}</span>
          <Plus size={18} />
        </button>

        <div className="flex items-start gap-3">
          <div className="text-end">
            <h1 className="text-3xl font-black" style={{ color: "#111827" }}>
              {copy.title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
              {copy.subtitle}
            </p>
          </div>
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ backgroundColor: "#e8eef7", color: "#173f78" }}
          >
            <Box size={22} />
          </div>
        </div>
      </div>

      {services.length === 0 ? (
        <div
          className="rounded-[28px] border p-10 text-center"
          style={{ backgroundColor: "#fff", borderColor: "#e5e7eb", color: "#64748b" }}
        >
          {copy.noServices}
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="rounded-[28px] border p-5"
              style={{ backgroundColor: "#fff", borderColor: "#e5e7eb" }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleDelete(service)}
                    className="mt-1 text-red-500 transition hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => openEditModal(service)}
                    className="mt-1 text-slate-700 transition hover:text-slate-900"
                  >
                    <Pencil size={18} />
                  </button>
                </div>

                <div className="flex flex-1 items-start justify-between gap-4">
                  <div className="flex-1 text-end">
                    <h3 className="text-2xl font-black text-slate-900">
                      {service.nameAr || service.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{service.name}</p>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{ backgroundColor: "#eef2ff", color: "#173f78" }}
                      >
                        {service.childTypes?.length || 0} {copy.childTypesCount}
                      </span>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{ backgroundColor: "#eef2ff", color: "#173f78" }}
                      >
                        {service.adultPricingType === "fixed" ? copy.adultsFixed : copy.adultsFree}
                      </span>
                    </div>
                  </div>

                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                    style={{ backgroundColor: "#e8eef7", color: "#173f78" }}
                  >
                    <Box size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-lg rounded-[28px] border p-5 md:p-7"
            style={{ backgroundColor: "#fff", borderColor: "#e5e7eb" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black text-slate-900">
                {editing ? copy.editService : copy.addService}
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  {copy.chooseService}
                </label>
                <select
                  value={form.serviceKey}
                  onChange={(event) => handleServiceSelect(event.target.value)}
                  className="h-[56px] w-full rounded-2xl border-2 px-4 text-[15px] font-medium outline-none"
                  style={{ borderColor: "#173f78", color: form.serviceKey ? "#111827" : "#94a3b8" }}
                >
                  <option value="">{copy.servicePlaceholder}</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {lang === "ar" ? option.nameAr : option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="flex items-center justify-end gap-2 rounded-2xl border px-4 py-3 text-[14px] font-bold"
                style={{ borderColor: "#e5e7eb", backgroundColor: "#f8fafc", color: "#475569" }}
              >
                <span style={{ color: "#f59e0b", fontSize: 16 }}>⚡</span>
                {copy.pricingHint}
              </div>

              <div className="rounded-[24px] border p-4" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <select
                    value={form.adultPricingType}
                    onChange={(event) => setForm((prev) => ({ ...prev, adultPricingType: event.target.value }))}
                    className="rounded-full border px-4 py-2 text-base font-medium"
                    style={{ borderColor: "#111827" }}
                  >
                    <option value="free">{copy.free}</option>
                    <option value="fixed">{copy.fixed}</option>
                  </select>
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <span>{copy.adult}</span>
                    <UserRound size={18} />
                  </div>
                </div>

                {form.adultPricingType === "fixed" && (
                  <div className="space-y-3">
                    {guestGroups.map((group) => {
                      const row = form.adultPrices.find((item) => String(item.groupId) === String(group.id));
                      return (
                        <div key={group.id} className="flex items-center justify-between gap-3 rounded-2xl border p-3" style={{ borderColor: "#e5e7eb", backgroundColor: "#fff" }}>
                          <div className="text-sm font-medium text-slate-600">
                            {group.name} ({group.currency})
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={row?.amount ?? 0}
                            onChange={(event) => setAdultPrice(group.id, event.target.value)}
                            className="h-10 w-28 rounded-full border px-4 text-center outline-none"
                            style={{ borderColor: "#e5e7eb" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border p-4" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={addChildType}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
                    style={{ borderColor: "#cbd5e1", backgroundColor: "#fff" }}
                  >
                    <span>{copy.addChild}</span>
                    <Plus size={16} />
                  </button>
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <span>{copy.childTypes}</span>
                    <Baby size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  {form.childTypes.map((child) => (
                    <div key={child.id} className="rounded-2xl border p-3" style={{ borderColor: "#e5e7eb", backgroundColor: "#fff" }}>
                      <div className="mb-3 flex items-center gap-3">
                        <button type="button" onClick={() => removeChildType(child.id)} className="text-red-500">
                          <Trash2 size={18} />
                        </button>
                        <select
                          value={child.pricingType}
                          onChange={(event) => updateChildType(child.id, "pricingType", event.target.value)}
                          className="rounded-full border px-4 py-2 text-base"
                          style={{ borderColor: "#cbd5e1" }}
                        >
                          <option value="free">{copy.free}</option>
                          <option value="fixed">{copy.fixed}</option>
                        </select>
                        <input
                          value={child.label}
                          onChange={(event) => updateChildType(child.id, "label", event.target.value)}
                          className="h-11 flex-1 rounded-full border px-4 outline-none"
                          style={{ borderColor: "#cbd5e1" }}
                        />
                      </div>

                      {child.pricingType === "fixed" && (
                        <div className="space-y-2">
                          {guestGroups.map((group) => {
                            const row = child.prices.find((item) => String(item.groupId) === String(group.id));
                            return (
                              <div key={`${child.id}-${group.id}`} className="flex items-center justify-between gap-3 rounded-2xl border p-3" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
                                <div className="text-sm font-medium text-slate-600">
                                  {group.name} ({group.currency})
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  value={row?.amount ?? 0}
                                  onChange={(event) => updateChildPrice(child.id, group.id, event.target.value)}
                                  className="h-10 w-28 rounded-full border px-4 text-center outline-none"
                                  style={{ borderColor: "#e5e7eb", backgroundColor: "#fff" }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[18px] font-black text-white"
                style={{ backgroundColor: "#173f78", opacity: saving ? 0.7 : 1 }}
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {editing ? copy.update : copy.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
