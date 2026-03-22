import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import RestaurantDetailsStepBar from "../../components/RestaurantDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const COPY = {
  en: {
    title: "Restaurant Description",
    error: "Please add a description with at least 10 English characters.",
    placeholder:
      "Describe your restaurant — its atmosphere, cuisine style, signature dishes, and dining experience.",
    characters: "characters",
    tipsTitle: "Writing Tips",
    tips: [
      "Mention the restaurant's unique atmosphere",
      "Highlight signature dishes or specialties",
      "Describe the dining experience",
      "Mention any awards or special features",
      "Keep it concise and inviting",
    ],
    languages: "Languages",
    english: "English",
    arabic: "Arabic",
    next: "Next -> Policy",
  },
  ar: {
    title: "وصف المطعم",
    error: "يرجى إضافة وصف لا يقل عن 10 أحرف باللغة الإنجليزية.",
    placeholder:
      "اكتب وصفاً للمطعم يوضح أجواءه وطابعه والأطباق المميزة وتجربة تناول الطعام.",
    characters: "حرف",
    tipsTitle: "نصائح للكتابة",
    tips: [
      "اذكر الأجواء المميزة للمطعم",
      "أبرز الأطباق الرئيسية والتخصصات",
      "صف تجربة تناول الطعام",
      "اذكر أي جوائز أو مميزات خاصة",
      "اجعل النص مختصراً ومقنعاً",
    ],
    languages: "اللغات",
    english: "الإنجليزية",
    arabic: "العربية",
    next: "التالي -> السياسة",
  },
};

const LangToggle = ({ lang, setLang }) => (
  <div className="flex items-center gap-1.5">
    {[
      { code: "en", flag: "us", label: "EN" },
      { code: "ar", flag: "eg", label: "AR" },
    ].map(({ code, flag, label }) => (
      <button
        key={code}
        onClick={() => setLang(code)}
        className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all"
        style={{
          backgroundColor:
            lang === code ? "var(--sidebar-active-text)" : "var(--bg-raised)",
          color: lang === code ? "#fff" : "var(--text-secondary)",
          border: `1px solid ${lang === code ? "var(--sidebar-active-text)" : "var(--border)"}`,
        }}
      >
        <img
          src={`https://flagcdn.com/w20/${flag}.png`}
          alt={label}
          className="h-4 w-5 rounded object-cover"
        />
        {label}
      </button>
    ))}
  </div>
);

const STORAGE_KEY = "restaurant_details_description";

export default function RestaurantDescriptionStep() {
  const navigate = useNavigate();
  const { lang: uiLang } = useLanguage();
  const copy = COPY[uiLang] || COPY.en;
  const [lang, setLang] = useState("en");

  const [descEn, setDescEn] = useState(
    () =>
      JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null")
        ?.descriptionEn || "",
  );
  const [descAr, setDescAr] = useState(
    () =>
      JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null")
        ?.descriptionAr || "",
  );
  const [error, setError] = useState("");

  const currentDesc = lang === "en" ? descEn : descAr;
  const setCurrentDesc = (value) => {
    if (lang === "en") setDescEn(value);
    else setDescAr(value);
    setError("");
  };

  const handleNext = () => {
    if (!descEn.trim() || descEn.trim().length < 10) {
      setError(copy.error);
      return;
    }
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ descriptionEn: descEn, descriptionAr: descAr }),
    );
    navigate("/restaurant/details/policy");
  };

  return (
    <div className="page-shell">
      <RestaurantDetailsStepBar />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--sidebar-active-text)" }}
            >
              {copy.title}
            </h2>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <textarea
            className="input w-full resize-none"
            style={{ minHeight: 260 }}
            placeholder={copy.placeholder}
            dir={lang === "ar" ? "rtl" : "ltr"}
            value={currentDesc}
            onChange={(e) => setCurrentDesc(e.target.value)}
          />
          {error && <p className="input-error mt-1">{error}</p>}
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {currentDesc.length} {copy.characters}
          </p>
        </div>

        <div className="card h-fit">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb size={16} style={{ color: "var(--warning)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {copy.tipsTitle}
            </span>
          </div>
          <ul className="space-y-2">
            {copy.tips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <span style={{ color: "var(--brand)" }}>·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleNext}
          className="btn btn-primary px-8 py-3 text-sm font-semibold rounded-2xl"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {copy.next} ›
        </button>
      </div>
    </div>
  );
}
