import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import GuestGroupDetailsStepBar from "../../../../components/GuestGroupDetailsStepBar";
import { DollarSign, ChevronDown } from "lucide-react";

const CURRENCIES = [
  "EGP",
  "SAR",
  "AED",
  "USD",
  "EUR",
  "GBP",
  "KWD",
  "QAR",
  "JOD",
];

export default function MainDetailsStep() {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();
  const [form, setForm] = useState({ nameEn: "", nameAr: "", currency: "EGP" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = sessionStorage.getItem("guest_group_main");
    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    const errs = {};
    if (!form.nameEn.trim() && !form.nameAr.trim()) {
      errs.name = lang === "ar" ? "الاسم مطلوب بالعربية أو الإنجليزية" : "Name required in English or Arabic";
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    sessionStorage.setItem("guest_group_main", JSON.stringify(form));
    navigate("/hotel/channel-manager/travky/guest-group/nationalities");
  };

  const handleNext = (e) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="page-shell" dir={dir}>
      <GuestGroupDetailsStepBar />
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {lang === "ar" ? "تفاصيل رئيسية" : "Main Details"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {lang === "ar" ? "أدخل اسم المجموعة والعملة" : "Enter group name and currency"}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                {lang === "ar" ? "الاسم (العربية)" : "Name (Arabic)"}
              </label>
              <input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="input"
                placeholder={lang === "ar" ? "اسم المجموعة بالعربية" : "Group name in Arabic"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                {lang === "ar" ? "الاسم (الإنجليزية)" : "Name (English)"}
              </label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="input"
                placeholder={lang === "ar" ? "اسم المجموعة بالإنجليزية" : "Group name in English"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                {lang === "ar" ? "العملة" : "Currency"}
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="input"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {errors.name && (
              <p className="input-error">{errors.name}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => navigate("/hotel/channel-manager/travky/guest-groups")} className="btn btn-secondary">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button type="submit" className="btn" style={{ backgroundColor: "var(--sidebar-active-text)", color: "white" }}>
                {lang === "ar" ? "التالي" : "Next"} <ChevronDown size={16} className={dir === "rtl" ? "rotate-90" : "-rotate-90"} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

