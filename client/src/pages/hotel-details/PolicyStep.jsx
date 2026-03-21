import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";

const MAX_LENGTH = 500;

const LangToggle = ({ lang, setLang }) => (
  <div className="flex items-center gap-1.5">
    <button
      onClick={() => setLang("en")}
      className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
      style={{
        backgroundColor:
          lang === "en" ? "var(--sidebar-active-text)" : "var(--bg-raised)",
        color: lang === "en" ? "#fff" : "var(--text-secondary)",
        border: `1px solid ${lang === "en" ? "var(--sidebar-active-text)" : "var(--border)"}`,
      }}
    >
      <img
        src="https://flagcdn.com/w20/us.png"
        alt="EN"
        className="h-4 w-5 rounded object-cover"
      />{" "}
      EN
    </button>
    <button
      onClick={() => setLang("ar")}
      className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
      style={{
        backgroundColor:
          lang === "ar" ? "var(--sidebar-active-text)" : "var(--bg-raised)",
        color: lang === "ar" ? "#fff" : "var(--text-secondary)",
        border: `1px solid ${lang === "ar" ? "var(--sidebar-active-text)" : "var(--border)"}`,
      }}
    >
      <img
        src="https://flagcdn.com/w20/eg.png"
        alt="AR"
        className="h-4 w-5 rounded object-cover"
      />{" "}
      AR
    </button>
  </div>
);

export default function HotelPolicyStep() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const [policyEn, setPolicyEn] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_policy") || "null")
        ?.policyEn || "",
  );
  const [policyAr, setPolicyAr] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_policy") || "null")
        ?.policyAr || "",
  );
  const [error, setError] = useState("");

  const current = lang === "en" ? policyEn : policyAr;
  const setCurrent = (v) => {
    lang === "en" ? setPolicyEn(v) : setPolicyAr(v);
    setError("");
  };

  const handleNext = () => {
    if (!policyEn.trim() || policyEn.trim().length < 10) {
      setError(
        "Please enter your hotel policy (at least 10 characters in English)",
      );
      return;
    }
    sessionStorage.setItem(
      "hotel_details_policy",
      JSON.stringify({ policyEn, policyAr }),
    );
    navigate("/hotel/details/photos");
  };

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor – 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              Hotel Policy
            </h2>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <div className="relative">
            <textarea
              className="input resize-none w-full pb-8"
              style={{ minHeight: 320 }}
              placeholder={
                lang === "en"
                  ? "Describe your cancellation policy, check-in/check-out rules, house rules, and any other important guest information..."
                  : "صف سياسة الإلغاء وقواعد تسجيل الوصول والمغادرة والقواعد الداخلية..."
              }
              dir={lang === "ar" ? "rtl" : "ltr"}
              maxLength={MAX_LENGTH}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <span
              className="absolute bottom-3 right-3 text-xs pointer-events-none"
              style={{
                color:
                  current.length >= MAX_LENGTH * 0.9
                    ? "var(--danger)"
                    : "var(--text-muted)",
              }}
            >
              {current.length} / {MAX_LENGTH}
            </span>
          </div>
          {error && <p className="input-error mt-1">{error}</p>}
        </div>

        {/* Tips panel – 1/3 */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} style={{ color: "var(--brand)" }} />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Policy Checklist
              </span>
            </div>
            <ul className="space-y-2">
              {[
                "Cancellation & refund terms",
                "Check-in / Check-out hours",
                "Accepted payment methods",
                "Pet & smoking policy",
                "Child / extra bed policy",
                "Dress code (if applicable)",
              ].map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span style={{ color: "var(--brand)" }}>·</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="btn btn-primary w-full py-3 text-base rounded-2xl"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          Next → Photos
        </button>
      </div>
    </div>
  );
}
