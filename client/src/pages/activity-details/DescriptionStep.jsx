import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityDetailsStepBar from "../../components/ActivityDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const COPY = {
  en: {
    title: "Activity Description",
    hint: "Describe your activity in both languages to reach a wider audience.",
    descriptionEn: "Description (English)",
    descriptionAr: "Description (Arabic)",
    placeholderEn: "Describe the activity in English...",
    placeholderAr: "اكتب وصف النشاط بالعربية...",
    next: "Next -> Icons",
    back: "Back",
  },
  ar: {
    title: "وصف النشاط",
    hint: "صف النشاط باللغتين للوصول إلى جمهور أوسع.",
    descriptionEn: "الوصف بالإنجليزية",
    descriptionAr: "الوصف بالعربية",
    placeholderEn: "Describe the activity in English...",
    placeholderAr: "اكتب وصف النشاط بالعربية...",
    next: "التالي -> المرافق",
    back: "رجوع",
  },
};

const STORAGE_KEY = "activity_details_description";

export default function ActivityDescriptionStep() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;

  const saved = (() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {}; }
    catch { return {}; }
  })();

  const [descriptionEn, setDescriptionEn] = useState(saved.descriptionEn || "");
  const [descriptionAr, setDescriptionAr] = useState(saved.descriptionAr || "");

  const handleNext = () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ descriptionEn: descriptionEn.trim(), descriptionAr: descriptionAr.trim() }));
    navigate("/activity/details/icons");
  };

  const textareaClass = "input w-full text-sm resize-none";

  return (
    <div className="page-shell">
      <ActivityDetailsStepBar />
      <div className="space-y-5">
        <div className="card">
          <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>{copy.hint}</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="label-text">{copy.descriptionEn}</label>
              <textarea className={textareaClass} rows={8} dir="ltr" value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)} placeholder={copy.placeholderEn} />
            </div>
            <div>
              <label className="label-text">{copy.descriptionAr}</label>
              <textarea className={textareaClass} rows={8} dir="rtl" value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)} placeholder={copy.placeholderAr} />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate("/activity/details/main")}
            className="btn btn-secondary rounded-2xl px-6 py-3 text-sm font-semibold">{copy.back}</button>
          <button onClick={handleNext}
            className="btn btn-primary rounded-2xl px-8 py-3 text-sm font-semibold"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}>{copy.next}</button>
        </div>
      </div>
    </div>
  );
}
