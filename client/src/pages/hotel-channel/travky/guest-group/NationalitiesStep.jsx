import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import GuestGroupDetailsStepBar from "../../../../components/GuestGroupDetailsStepBar";
import { Users } from "lucide-react";

const NATIONALITIES = [
  "Egyptian", "Saudi", "Emirati", "Kuwaiti", "Qatari", "Jordanian", "Bahraini",
  "British", "French", "German", "American", "Italian", "Spanish", "Dutch",
  "Russian", "Chinese", "Indian", "Turkish", "Belgian", "Austrian",
];

export default function NationalitiesStep() {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();
  const [nationalities, setNationalities] = useState([]);

  useEffect(() => {
    const savedMain = sessionStorage.getItem("guest_group_main");
    if (!savedMain) {
      navigate("/hotel/channel-manager/travky/guest-group/main");
      return;
    }

    const saved = sessionStorage.getItem("guest_group_nationalities");
    if (saved) {
      setNationalities(JSON.parse(saved));
    }
  }, [navigate]);

  const toggleNationality = (nat) => {
    setNationalities((prev) =>
      prev.includes(nat)
        ? prev.filter((n) => n !== nat)
        : [...prev, nat]
    );
  };

  const handleSave = () => {
    sessionStorage.setItem("guest_group_nationalities", JSON.stringify(nationalities));
    navigate("/hotel/channel-manager/travky/guest-group/view");
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
            {lang === "ar" ? "الجنسيات" : "Nationalities"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {lang === "ar" ? "اختر الجنسيات المرتبطة بهذه المجموعة" : "Select nationalities for this group"}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleNext}>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                {NATIONALITIES.map((nat) => {
                  const active = nationalities.includes(nat);
                  return (
                    <button
                      key={nat}
                      type="button"
                      onClick={() => toggleNationality(nat)}
                      className="chip cursor-pointer transition-all p-2 rounded-lg"
                      style={{
                        backgroundColor: active ? "rgba(59,130,246,0.1)" : "transparent",
                        borderColor: active ? "var(--sidebar-active-text)" : "var(--border)",
                        color: active ? "var(--sidebar-active-text)" : "var(--text-secondary)",
                      }}
                    >
                      {nat}
                    </button>
                  );
                })}
              </div>
              {nationalities.length === 0 && (
                <p className="text-sm mt-3 text-center" style={{ color: "var(--text-muted)" }}>
                  {lang === "ar" ? "اختر جنسية واحدة على الأقل" : "Select at least one nationality"}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => navigate("/hotel/channel-manager/travky/guest-group/main")} className="btn btn-secondary">
                {lang === "ar" ? "السابق" : "Previous"}
              </button>
              <button type="submit" disabled={nationalities.length === 0} className="btn disabled:opacity-50" style={{ backgroundColor: "var(--sidebar-active-text)", color: "white" }}>
                {lang === "ar" ? "معاينة" : "Preview"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
