import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import GuestGroupDetailsStepBar from "../../../../components/GuestGroupDetailsStepBar";
import { Users, DollarSign, Edit3, Trash2 } from "lucide-react";
import DeleteConfirmModal from "../../../../components/DeleteConfirmModal";

export default function GuestGroupDetailsView() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [main, setMain] = useState(null);
  const [nationalities, setNationalities] = useState([]);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const mainData = sessionStorage.getItem("guest_group_main");
    const natData = sessionStorage.getItem("guest_group_nationalities");
    if (mainData) setMain(JSON.parse(mainData));
    if (natData) setNationalities(JSON.parse(natData));
  }, []);

  const handleEdit = () => navigate("/hotel/channel-manager/travky/guest-group/main");
  const handleDelete = () => setShowDelete(true);
  const confirmDelete = () => {
    sessionStorage.removeItem("guest_group_main");
    sessionStorage.removeItem("guest_group_nationalities");
    navigate("/hotel/channel-manager/travky/guest-groups");
  };

  const primaryName = lang === "ar" ? main?.nameAr || main?.nameEn : main?.nameEn || main?.nameAr;
  const secondaryName = lang === "ar" ? main?.nameEn : main?.nameAr;

  if (!main) {
    return (
      <div className="page-shell flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "var(--bg-raised)" }}>
          <Users size={36} style={{ color: "var(--text-muted)" }} />
        </div>
        <div className="text-center">
          <p className="mb-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {lang === "ar" ? "لا توجد تفاصيل مجموعة ضيوف بعد" : "No guest group details yet"}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {lang === "ar" ? "أكمل خطوات الإعداد لرؤية معاينة مجموعة الضيوف هنا." : "Complete the setup wizard to see your guest group profile here."}
          </p>
        </div>
        <button
          onClick={() => navigate("/hotel/channel-manager/travky/guest-group/main")}
          className="btn rounded-2xl px-8 py-3 text-sm font-semibold"
          style={{ backgroundColor: "var(--sidebar-active-text)" }}
        >
          {lang === "ar" ? "ابدأ بإضافة التفاصيل" : "Start Adding Details"}
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-5">
      <DeleteConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        message={lang === "ar" ? "سيؤدي هذا إلى حذف كل تفاصيل مجموعة الضيوف وإعادة بدء الخطوات. هل تريد المتابعة؟" : "This will delete all guest group details and restart the wizard. Continue?"}
      />
      <GuestGroupDetailsStepBar />

      <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-raised)", border: "2px solid var(--border)" }}>
            <Users size={32} style={{ color: "var(--text-muted)" }} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-extrabold leading-tight" style={{ color: "var(--text-primary)" }} dir={lang === "ar" ? "rtl" : "ltr"}>
                  {primaryName || "—"}
                </h1>
                {secondaryName && (
                  <p className="mt-0.5 text-sm font-medium" dir={lang === "ar" ? "ltr" : "rtl"} style={{ color: "var(--text-secondary)" }}>
                    {secondaryName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleEdit} className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold" style={{ backgroundColor: "var(--sidebar-active-text)", color: "#fff" }}>
                  <Edit3 size={13} />
                  {lang === "ar" ? "تعديل" : "Edit"}
                </button>
                <button onClick={handleDelete} className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold" style={{ backgroundColor: "var(--bg-raised)", color: "var(--danger)", border: "1px solid var(--border)" }}>
                  <Trash2 size={13} />
                  {lang === "ar" ? "حذف" : "Delete"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  {lang === "ar" ? "العملة" : "Currency"}
                </p>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {main.currency || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  {lang === "ar" ? "عدد الجنسيات" : "Nationalities Count"}
                </p>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {nationalities.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nationalities.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} style={{ color: "var(--sidebar-active-text)" }} />
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {lang === "ar" ? "الجنسيات المحددة" : "Selected Nationalities"}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {nationalities.map((nat) => (
              <span key={nat} className="chip text-xs">
                {nat}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button onClick={() => navigate("/hotel/channel-manager/travky/guest-groups")} className="btn btn-secondary">
          {lang === "ar" ? "إلى القائمة" : "To List"}
        </button>
        <button onClick={handleEdit} className="btn" style={{ backgroundColor: "var(--sidebar-active-text)", color: "white" }}>
          {lang === "ar" ? "تعديل" : "Edit"}
        </button>
      </div>
    </div>
  );
}

