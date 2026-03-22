import { useMemo, useState } from "react";
import { Globe, Link2, PlusCircle, Users } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const CURRENCY_OPTIONS = ["USD", "EUR", "SAR", "AED", "EGP"];
const NATIONALITY_OPTIONS = [
  { en: "Egyptian", ar: "مصري" },
  { en: "Saudi", ar: "سعودي" },
  { en: "Emirati", ar: "إماراتي" },
  { en: "Kuwaiti", ar: "كويتي" },
  { en: "Jordanian", ar: "أردني" },
  { en: "International", ar: "دولي" },
];

const COPY = {
  en: {
    headerTitle: "Channel Manager",
    headerBody:
      "A dedicated hotel channel manager connects your room pricing API to Travky and external booking platforms.",
    travkyTitle: "Travky",
    travkyBody:
      "Internal configuration area for the hotel account created on the platform.",
    externalTitle: "External",
    externalBody:
      "Connection layer for future integrations with third-party booking channels.",
    sectionGroupTravky: "Travky Section",
    sectionGroupExternal: "External Section",
    guestGroups: {
      title: "Guest Groups",
      subtitle:
        "Create the guest group name and define the linked currency and nationalities.",
      cardTitle: "Add Guest Group",
      nameLabel: "Guest Group Name",
      currencyLabel: "Currency",
      nationalityLabel: "Nationalities",
      previewTitle: "Current Preview",
      previewEmpty:
        "Start filling the fields to preview the guest group setup.",
      addButton: "Add Guest Group",
    },
    meal_plans: {
      title: "Meal Plans",
      subtitle:
        "This page will manage meal plan structures linked to channel pricing.",
    },
    periods: {
      title: "Periods",
      subtitle:
        "This page will define date periods and seasonal pricing windows.",
    },
    supplements: {
      title: "Supplement",
      subtitle:
        "This page will manage additional pricing supplements and conditions.",
    },
    refund_policies: {
      title: "Refund Policy",
      subtitle:
        "This page will manage refund and cancellation rules for the channel manager.",
    },
    channel_manager_rooms: {
      title: "Rooms",
      subtitle: "This page will map hotel rooms to channel manager room types.",
    },
    rates: {
      title: "Rates",
      subtitle: "This page will control pricing plans and rate distribution.",
    },
    availability: {
      title: "Availability",
      subtitle:
        "This page will manage room inventory and availability synchronization.",
    },
    channel_manager_external: {
      title: "External",
      subtitle:
        "This page will connect the hotel's channel manager API with external booking platforms.",
    },
    comingSoon:
      "Initial placeholder ready. You can now start filling the business content for this page.",
  },
  ar: {
    headerTitle: "مدير القنوات",
    headerBody:
      "مدير قنوات خاص بكل فندق يربط واجهة أسعار الغرف مع Travky ومع منصات الحجز الخارجية الأخرى.",
    travkyTitle: "Travky",
    travkyBody:
      "منطقة الإعدادات الداخلية الخاصة بحساب الفندق الذي يتم إنشاؤه على المنصة.",
    externalTitle: "خارجي",
    externalBody:
      "طبقة الربط الخاصة بالتكاملات المستقبلية مع منصات الحجز الخارجية.",
    sectionGroupTravky: "قسم Travky",
    sectionGroupExternal: "قسم خارجي",
    guestGroups: {
      title: "مجموعات النزلاء",
      subtitle: "أضف اسم مجموعة النزلاء وحدد العملة والجنسيات المرتبطة بها.",
      cardTitle: "إضافة مجموعة نزلاء",
      nameLabel: "اسم مجموعة النزلاء",
      currencyLabel: "العملة",
      nationalityLabel: "الجنسيات",
      previewTitle: "المعاينة الحالية",
      previewEmpty: "ابدأ بتعبئة الحقول لعرض معاينة إعداد مجموعة النزلاء.",
      addButton: "إضافة مجموعة نزلاء",
    },
    meal_plans: {
      title: "خطط الوجبات",
      subtitle: "هذه الصفحة ستدير هياكل خطط الوجبات المرتبطة بتسعير القنوات.",
    },
    periods: {
      title: "الفترات",
      subtitle: "هذه الصفحة ستحدد الفترات الزمنية والنوافذ الموسمية للتسعير.",
    },
    supplements: {
      title: "الإضافات",
      subtitle: "هذه الصفحة ستدير الإضافات السعرية والشروط المرتبطة بها.",
    },
    refund_policies: {
      title: "سياسة الاسترداد",
      subtitle: "هذه الصفحة ستدير قواعد الاسترداد والإلغاء في مدير القنوات.",
    },
    channel_manager_rooms: {
      title: "الغرف",
      subtitle: "هذه الصفحة ستربط غرف الفندق بأنواع الغرف داخل مدير القنوات.",
    },
    rates: {
      title: "الأسعار",
      subtitle: "هذه الصفحة ستتحكم في خطط الأسعار وتوزيعها على القنوات.",
    },
    availability: {
      title: "الإتاحة",
      subtitle: "هذه الصفحة ستدير المخزون وتزامن الإتاحة للغرف.",
    },
    channel_manager_external: {
      title: "خارجي",
      subtitle:
        "هذه الصفحة ستربط واجهة مدير القنوات الخاصة بالفندق مع منصات الحجز الخارجية.",
    },
    comingSoon:
      "تم تجهيز هيكل الصفحة مبدئياً ويمكنك الآن استكمال المحتوى التجاري الخاص بها.",
  },
};

function SectionCard({ icon: Icon, title, body }) {
  return (
    <div
      className="rounded-3xl border p-5 shadow-sm"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={20} />
      </div>
      <h3
        className="text-base font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-sm leading-6"
        style={{ color: "var(--text-secondary)" }}
      >
        {body}
      </p>
    </div>
  );
}

export default function HotelChannelManagerPage({ sectionKey }) {
  const { lang, dir } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const [guestGroupName, setGuestGroupName] = useState("");
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
  const [nationalities, setNationalities] = useState([]);

  const section = useMemo(() => {
    if (sectionKey === "guest_groups") {
      return {
        group: copy.sectionGroupTravky,
        ...copy.guestGroups,
      };
    }

    if (sectionKey === "channel_manager_external") {
      return {
        group: copy.sectionGroupExternal,
        ...copy.channel_manager_external,
      };
    }

    return {
      group: copy.sectionGroupTravky,
      ...(copy[sectionKey] || {}),
    };
  }, [copy, sectionKey]);

  const toggleNationality = (option) => {
    setNationalities((prev) =>
      prev.includes(option)
        ? prev.filter((entry) => entry !== option)
        : [...prev, option],
    );
  };

  return (
    <div className="space-y-6 pb-6" dir={dir}>
      <div
        className="rounded-[28px] border p-6 shadow-sm"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {copy.headerTitle}
          </span>
          <h1
            className="mt-4 text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {copy.headerTitle}
          </h1>
          <p
            className="mt-2 text-sm leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            {copy.headerBody}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard
            icon={Link2}
            title={copy.travkyTitle}
            body={copy.travkyBody}
          />
          <SectionCard
            icon={Globe}
            title={copy.externalTitle}
            body={copy.externalBody}
          />
        </div>
      </div>

      <div
        className="rounded-[28px] border p-6 shadow-sm"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {section.group}
            </span>
            <h2
              className="mt-3 text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {section.title}
            </h2>
            <p
              className="mt-2 max-w-3xl text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              {section.subtitle}
            </p>
          </div>
        </div>

        {sectionKey === "guest_groups" ? (
          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.9fr]">
            <div
              className="rounded-3xl border p-5"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-raised)",
              }}
            >
              <div className="mb-5 flex items-center gap-2">
                <PlusCircle
                  size={18}
                  style={{ color: "var(--sidebar-active-text)" }}
                />
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {copy.guestGroups.cardTitle}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {copy.guestGroups.nameLabel}
                  </label>
                  <input
                    value={guestGroupName}
                    onChange={(event) => setGuestGroupName(event.target.value)}
                    className="input h-11 w-full"
                    placeholder={copy.guestGroups.nameLabel}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {copy.guestGroups.currencyLabel}
                  </label>
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="input h-11 w-full"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {copy.guestGroups.nationalityLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NATIONALITY_OPTIONS.map((option) => {
                      const label = lang === "ar" ? option.ar : option.en;
                      const active = nationalities.includes(option.en);

                      return (
                        <button
                          key={option.en}
                          type="button"
                          onClick={() => toggleNationality(option.en)}
                          className="rounded-2xl border px-3 py-2 text-sm font-medium transition-all"
                          style={{
                            backgroundColor: active
                              ? "var(--sidebar-active-text)"
                              : "var(--bg-surface)",
                            color: active ? "#fff" : "var(--text-secondary)",
                            borderColor: active
                              ? "var(--sidebar-active-text)"
                              : "var(--border)",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl border p-5"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-raised)",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Users
                  size={18}
                  style={{ color: "var(--sidebar-active-text)" }}
                />
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {copy.guestGroups.previewTitle}
                </h3>
              </div>

              {guestGroupName || nationalities.length ? (
                <div
                  className="space-y-3 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <div>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {copy.guestGroups.nameLabel}:
                    </span>{" "}
                    {guestGroupName || "-"}
                  </div>
                  <div>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {copy.guestGroups.currencyLabel}:
                    </span>{" "}
                    {currency}
                  </div>
                  <div>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {copy.guestGroups.nationalityLabel}:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {nationalities.map((item) => {
                        const option = NATIONALITY_OPTIONS.find(
                          (entry) => entry.en === item,
                        );
                        return (
                          <span
                            key={item}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          >
                            {lang === "ar" ? option?.ar || item : item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm leading-7"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {copy.guestGroups.previewEmpty}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            className="mt-6 rounded-3xl border border-dashed p-6"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-raised)",
            }}
          >
            <p
              className="text-sm leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              {copy.comingSoon}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
