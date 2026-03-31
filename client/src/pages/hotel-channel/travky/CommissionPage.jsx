import { useState } from "react";
import { Percent, ChevronLeft, ChevronRight } from "lucide-react";
import { useChannelSection } from "../../../hooks/useChannelSection";
import { useAppSetting } from "../../../hooks/useAppSetting";
import { useLanguage } from "../../../context/LanguageContext";

const DEFAULT_PLATFORM_FEES = {
  b2c: { platformFee: "3", minCommission: "4" },
  b2b: { platformFee: "2.5", minCommission: "10" },
};

const DEFAULT_HOTEL_COMMISSION = {
  b2c: { minCommission: "0" },
  b2b: { minCommission: "0" },
};

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export default function CommissionPage() {
  const { t, lang } = useLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Read-only platform fees set by super-admin
  const [platformFees] = useAppSetting("platform_fees", DEFAULT_PLATFORM_FEES);

  // Hotel's own minimum commission
  const [hotelComm, setHotelComm] = useChannelSection(
    "commission",
    DEFAULT_HOTEL_COMMISSION,
  );

  const [saved, setSaved] = useState(false);

  function setMin(tier, val) {
    if (val !== "" && isNaN(Number(val))) return;
    setHotelComm((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], minCommission: val },
    }));
    setSaved(false);
  }

  function handleNext() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TIERS = [
    {
      key: "b2c",
      titleKey: "comm_b2cTitle",
      subtitleKey: "comm_b2cSubtitle",
      accentBg: "#f0fdf4",
      accentBorder: "#bbf7d0",
    },
    {
      key: "b2b",
      titleKey: "comm_b2bTitle",
      subtitleKey: "comm_b2bSubtitle",
      accentBg: "#f5f3ff",
      accentBorder: "#ddd6fe",
    },
  ];

  return (
    <div className="page-shell" dir={dir}>
      {/* Header */}
      <div
        className="flex items-center justify-between mb-2"
        style={{ flexDirection: dir === "rtl" ? "row-reverse" : "row" }}
      >
        <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {t("comm_pageTitle")}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {t("comm_pageSubtitle")}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-2xl grid place-items-center"
          style={{ backgroundColor: "#e0e7ff" }}
        >
          <Percent size={20} style={{ color: "#4f46e5" }} />
        </div>
      </div>

      {/* Two tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {TIERS.map(({ key, titleKey, subtitleKey, accentBg, accentBorder }) => {
          const pf = toNum(platformFees?.[key]?.platformFee ?? 0);
          const minVal = hotelComm?.[key]?.minCommission ?? "0";
          const totalNum = pf + toNum(minVal);
          const total = Number.isInteger(totalNum) ? String(totalNum) : totalNum.toString();

          return (
            <div
              key={key}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Card header */}
              <div
                className="px-5 py-4 text-end"
                style={{
                  backgroundColor: accentBg,
                  borderBottom: `1px solid ${accentBorder}`,
                }}
              >
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {t(titleKey)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {t(subtitleKey)}
                </p>
              </div>

              {/* Card body */}
              <div className="px-5 py-5 space-y-5">
                {/* Platform Fees row — read only */}
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {pf}%
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    {t("comm_platformFees")}
                  </span>
                </div>

                {/* Min Commission input */}
                <div>
                  <p
                    className="text-sm font-semibold mb-2 text-end"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t("comm_minLabel")}
                  </p>
                  <div className="flex items-center gap-2" dir="ltr">
                    <span
                      className="text-sm font-bold w-6 text-center shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      %
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={minVal}
                      onChange={(e) => setMin(key, e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none text-end"
                      style={{
                        backgroundColor: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                {/* Total row */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--sidebar-active-text)" }}
                  >
                    {total}%
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {t("comm_totalLabel")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula note */}
      <p
        className="text-sm mt-4 text-end"
        style={{ color: "var(--text-secondary)" }}
      >
        {t("comm_formulaNote")}
      </p>

      {/* Next button */}
      <div className={`flex mt-6 ${dir === "rtl" ? "justify-start" : "justify-end"}`}>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{ backgroundColor: saved ? "#10b981" : "#1e3a5f" }}
        >
          {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {saved ? t("comm_saved") : t("comm_next")}
        </button>
      </div>
    </div>
  );
}
