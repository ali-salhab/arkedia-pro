import { useState } from "react";
import { Save, Landmark } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const SCOPES = [
  { key: "all", labelKey: "pfScope_allHotels" },
  { key: "country", labelKey: "pfScope_byCountry" },
  { key: "city", labelKey: "pfScope_byCity" },
  { key: "specific", labelKey: "pfScope_specificHotel" },
];

const INITIAL_FEES = {
  b2c: { platformFee: "3", minCommission: "4" },
  b2b: { platformFee: "2.5", minCommission: "10" },
};

export default function PlatformFeesHotelsPage() {
  const { t, lang } = useLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [scope, setScope] = useState("all");
  const [fees, setFees] = useLocalStorage("platform_fees", INITIAL_FEES);
  const [saved, setSaved] = useState(false);

  const setFee = (tier, field) => (e) => {
    const val = e.target.value;
    if (val !== "" && isNaN(Number(val))) return;
    setFees((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: val },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-shell" dir={dir}>
      {/* Page Header */}
      <div
        className="flex items-start justify-between mb-6"
        style={{ flexDirection: dir === "rtl" ? "row-reverse" : "row" }}
      >
        <div className={dir === "rtl" ? "text-right" : "text-left"}>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {t("pfPage_title")}
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("pfPage_subtitle")}
          </p>
        </div>
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: "#f97316" }}
        >
          <Landmark size={20} color="#fff" />
        </div>
      </div>

      {/* Scope selector */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("pfScope_label")}
        </p>
        <div className="flex flex-wrap gap-2">
          {SCOPES.map((s) => {
            const active = scope === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? "#1e3a5f" : "var(--bg-raised)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  border: active
                    ? "1px solid #1e3a5f"
                    : "1px solid var(--border)",
                }}
              >
                {t(s.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* B2C */}
        <FeeCard
          title="B2C Platform Fees"
          accentBg="#f0fdf4"
          accentBorder="#bbf7d0"
          fees={fees.b2c}
          onChangeFee={setFee}
          tier="b2c"
          dir={dir}
          t={t}
        />
        {/* B2B */}
        <FeeCard
          title="B2B Platform Fees"
          accentBg="#f5f3ff"
          accentBorder="#ddd6fe"
          fees={fees.b2b}
          onChangeFee={setFee}
          tier="b2b"
          dir={dir}
          t={t}
        />
      </div>

      {/* Save */}
      <div
        className={dir === "rtl" ? "flex justify-start" : "flex justify-end"}
      >
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            backgroundColor: saved ? "#10b981" : "#1e3a5f",
            color: "#fff",
          }}
        >
          <Save size={16} />
          {saved ? t("pfSaved") : t("save")}
        </button>
      </div>
    </div>
  );
}

function FeeCard({
  title,
  accentBg,
  accentBorder,
  fees,
  onChangeFee,
  tier,
  dir,
  t,
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Card header band */}
      <div
        className="px-5 py-3"
        style={{
          backgroundColor: accentBg,
          borderBottom: `1px solid ${accentBorder}`,
        }}
      >
        <h3
          className="text-sm font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-5">
        {/* Platform Fee */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: "var(--text-secondary)",
              textAlign: dir === "rtl" ? "right" : "left",
            }}
          >
            {t("pfField_platformFee")}
          </label>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              %
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={fees.platformFee}
              onChange={onChangeFee(tier, "platformFee")}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none text-end"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Min Commission */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: "var(--text-secondary)",
              textAlign: dir === "rtl" ? "right" : "left",
            }}
          >
            {t("pfField_minCommission")}
          </label>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              %
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={fees.minCommission}
              onChange={onChangeFee(tier, "minCommission")}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none text-end"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <p
            className="text-xs mt-1.5"
            style={{
              color: "var(--text-muted)",
              textAlign: dir === "rtl" ? "right" : "left",
            }}
          >
            {t("pfField_minCommissionHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
