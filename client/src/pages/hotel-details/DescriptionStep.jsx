import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import HotelDetailsStepBar from "../../components/HotelDetailsStepBar";

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

export default function HotelDescriptionStep() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const [descEn, setDescEn] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_description") || "null")
        ?.descriptionEn || "",
  );
  const [descAr, setDescAr] = useState(
    () =>
      JSON.parse(sessionStorage.getItem("hotel_details_description") || "null")
        ?.descriptionAr || "",
  );
  const [error, setError] = useState("");

  const currentDesc = lang === "en" ? descEn : descAr;
  const setCurrentDesc = (v) => {
    lang === "en" ? setDescEn(v) : setDescAr(v);
    setError("");
  };

  const handleNext = () => {
    if (!descEn.trim() || descEn.trim().length < 10) {
      setError(
        "Please add a hotel description (at least 10 characters in English)",
      );
      return;
    }
    sessionStorage.setItem(
      "hotel_details_description",
      JSON.stringify({ descriptionEn: descEn, descriptionAr: descAr }),
    );
    navigate("/hotel/details/icons");
  };

  return (
    <div className="page-shell">
      <HotelDetailsStepBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor – takes 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              Hotel Description
            </h2>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <textarea
            className="input resize-none w-full"
            style={{ minHeight: 320 }}
            placeholder={
              lang === "en"
                ? "Describe your hotel — highlight its unique character, ambiance, and guest experience..."
                : "صف فندقك - أبرز ميزاته وأجوائه..."
            }
            dir={lang === "ar" ? "rtl" : "ltr"}
            value={currentDesc}
            onChange={(e) => setCurrentDesc(e.target.value)}
          />
          {error && <p className="input-error mt-1">{error}</p>}
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {currentDesc.length} characters
          </p>
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
              <Lightbulb size={16} style={{ color: "var(--warning)" }} />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Writing Tips
              </span>
            </div>
            <ul className="space-y-2">
              {[
                "Mention the hotel's location benefits",
                "Describe the atmosphere & style",
                "Highlight signature amenities",
                "Mention nearby attractions",
                "Keep it concise and compelling",
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

          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Languages
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                <img
                  src="https://flagcdn.com/w20/us.png"
                  alt="EN"
                  className="inline h-3.5 w-4 rounded mr-1 object-cover"
                />
                English
              </span>{" "}
              — primary language, required.
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                <img
                  src="https://flagcdn.com/w20/eg.png"
                  alt="AR"
                  className="inline h-3.5 w-4 rounded mr-1 object-cover"
                />
                Arabic
              </span>{" "}
              — optional, shown to Arabic-speaking guests.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="btn btn-primary w-full py-3 text-base rounded-2xl"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          Next → Icons
        </button>
      </div>
    </div>
  );
}
