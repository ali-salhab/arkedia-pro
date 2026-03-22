import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ActivityDetailsStepBar from "../../components/ActivityDetailsStepBar";
import { useLanguage } from "../../context/LanguageContext";

const COPY = {
  en: {
    title: "Activity Policy",
    hint: "Set key details about your activity's requirements and policies.",
    duration: "Duration",
    durationPlaceholder: "e.g. 3 hours, Half day, Full day",
    groupSize: "Max Group Size",
    groupSizePlaceholder: "e.g. 10 people",
    minAge: "Minimum Age",
    minAgePlaceholder: "e.g. 12 years",
    difficulty: "Difficulty Level",
    difficultyOptions: ["Easy", "Moderate", "Challenging", "Expert Only"],
    cancellation: "Cancellation Policy",
    cancellationPlaceholder: "Describe your cancellation policy...",
    included: "What's Included",
    includedPlaceholder: "Equipment, guide, transport...",
    notIncluded: "What's Not Included",
    notIncludedPlaceholder: "Personal expenses, tips...",
    next: "Next -> Photos",
    back: "Back",
  },
  ar: {
    title: "سياسة النشاط",
    hint: "حدد التفاصيل الرئيسية حول متطلبات النشاط وسياساته.",
    duration: "المدة",
    durationPlaceholder: "مثل: 3 ساعات، نصف يوم، يوم كامل",
    groupSize: "الحد الأقصى لحجم المجموعة",
    groupSizePlaceholder: "مثل: 10 أشخاص",
    minAge: "الحد الأدنى للسن",
    minAgePlaceholder: "مثل: 12 سنة",
    difficulty: "مستوى الصعوبة",
    difficultyOptions: ["سهل", "متوسط", "صعب", "للخبراء فقط"],
    cancellation: "سياسة الإلغاء",
    cancellationPlaceholder: "اشرح سياسة الإلغاء...",
    included: "ما يشمله النشاط",
    includedPlaceholder: "المعدات، المرشد، النقل...",
    notIncluded: "ما لا يشمله النشاط",
    notIncludedPlaceholder: "النفقات الشخصية، الإكراميات...",
    next: "التالي -> الصور",
    back: "رجوع",
  },
};

const DIFFICULTY_EN = ["Easy", "Moderate", "Challenging", "Expert Only"];
const STORAGE_KEY = "activity_details_policy";

export default function ActivityPolicyStep() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.en;

  const saved = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") || {};
    } catch {
      return {};
    }
  })();

  const [duration, setDuration] = useState(saved.duration || "");
  const [groupSize, setGroupSize] = useState(saved.groupSize || "");
  const [minAge, setMinAge] = useState(saved.minAge || "");
  const [difficulty, setDifficulty] = useState(saved.difficulty || "");
  const [cancellation, setCancellation] = useState(saved.cancellation || "");
  const [included, setIncluded] = useState(saved.included || "");
  const [notIncluded, setNotIncluded] = useState(saved.notIncluded || "");

  const handleNext = () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        duration,
        groupSize,
        minAge,
        difficulty,
        cancellation,
        included,
        notIncluded,
      }),
    );
    navigate("/activity/details/photos");
  };

  const inputClass = "input w-full text-sm";
  const textareaClass = "input w-full text-sm resize-none";

  return (
    <div className="page-shell">
      <ActivityDetailsStepBar />
      <div className="space-y-5">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {copy.hint}
        </p>

        <div className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">{copy.duration}</label>
            <input
              className={inputClass}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={copy.durationPlaceholder}
            />
          </div>
          <div>
            <label className="label-text">{copy.groupSize}</label>
            <input
              className={inputClass}
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              placeholder={copy.groupSizePlaceholder}
            />
          </div>
          <div>
            <label className="label-text">{copy.minAge}</label>
            <input
              className={inputClass}
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder={copy.minAgePlaceholder}
            />
          </div>
          <div>
            <label className="label-text">{copy.difficulty}</label>
            <div className="relative">
              <select
                className="input w-full text-sm appearance-none"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">{copy.difficulty}</option>
                {DIFFICULTY_EN.map((d, i) => (
                  <option key={d} value={d}>
                    {copy.difficultyOptions[i] || d}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          </div>
        </div>

        <div className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">{copy.included}</label>
            <textarea
              className={textareaClass}
              rows={4}
              value={included}
              onChange={(e) => setIncluded(e.target.value)}
              placeholder={copy.includedPlaceholder}
            />
          </div>
          <div>
            <label className="label-text">{copy.notIncluded}</label>
            <textarea
              className={textareaClass}
              rows={4}
              value={notIncluded}
              onChange={(e) => setNotIncluded(e.target.value)}
              placeholder={copy.notIncludedPlaceholder}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">{copy.cancellation}</label>
            <textarea
              className={textareaClass}
              rows={4}
              value={cancellation}
              onChange={(e) => setCancellation(e.target.value)}
              placeholder={copy.cancellationPlaceholder}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate("/activity/details/icons")}
            className="btn btn-secondary rounded-2xl px-6 py-3 text-sm font-semibold"
          >
            {copy.back}
          </button>
          <button
            onClick={handleNext}
            className="btn btn-primary rounded-2xl px-8 py-3 text-sm font-semibold"
            style={{ backgroundColor: "var(--sidebar-active-text)" }}
          >
            {copy.next}
          </button>
        </div>
      </div>
    </div>
  );
}
