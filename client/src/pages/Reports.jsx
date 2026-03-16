import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../context/LanguageContext";
import { useGetReportsQuery } from "../store/services/api";

export default function ReportsPage() {
  const { data, isLoading, error } = useGetReportsQuery();
  const { t, lang } = useLanguage();
  const reports = Array.isArray(data) ? data : [];

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const getTypeLabel = (type) => {
    const map = {
      monthly: t("reportTypeMonthly"),
      bookings: t("reportTypeBookings"),
      status: t("reportTypeStatus"),
    };
    return map[type] || type || "-";
  };

  const getStatusLabel = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "ready") return t("reportReady");
    if (normalized === "processing") return t("reportProcessing");
    return normalized || "-";
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "ready") {
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #86efac",
      };
    }
    if (normalized === "processing") {
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fcd34d",
      };
    }
    return {
      background: "#e2e8f0",
      color: "#334155",
      border: "1px solid #cbd5e1",
    };
  };

  const reportColumns = [
    { key: "name", label: t("reportName") },
    {
      key: "type",
      label: t("reportType"),
      render: (value) => getTypeLabel(value),
    },
    {
      key: "period",
      label: t("reportPeriod"),
      render: (value) =>
        value === "all_time" ? t("reportPeriodAllTime") : value,
    },
    {
      key: "generatedAt",
      label: t("reportGenerated"),
      render: (v) => formatDate(v),
    },
    {
      key: "status",
      label: t("reportStatus"),
      render: (value) => (
        <span
          style={{
            ...getStatusStyle(value),
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {getStatusLabel(value)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <LoadingScreen
        label={t("loadingReportsData")}
        statCount={4}
        tableRows={6}
        tableCols={5}
      />
    );
  }

  if (error)
    return (
      <div className="card text-center text-sm font-medium text-rose-500">
        {t("errorLoadingReports")}
      </div>
    );

  const now = new Date();
  const thisMonthCount = reports.filter((report) => {
    if (!report.generatedAt) return false;
    const generated = new Date(report.generatedAt);
    return (
      generated.getMonth() === now.getMonth() &&
      generated.getFullYear() === now.getFullYear()
    );
  }).length;

  const readyCount = reports.filter(
    (r) => String(r.status || "").toLowerCase() === "ready",
  ).length;

  const processingCount = reports.filter(
    (r) => String(r.status || "").toLowerCase() === "processing",
  ).length;

  return (
    <div className="space-y-6">
      <section className="card space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {t("reports")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {t("reportsSubtitle")}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-indigo-900">
            {t("reportTotal")}
          </h2>
          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {reports.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-emerald-900">
            {t("reportReady")}
          </h2>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {readyCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-amber-900">
            {t("reportProcessing")}
          </h2>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {processingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-sky-900">
            {t("reportThisMonth")}
          </h2>
          <p className="mt-2 text-2xl font-bold text-sky-600">
            {thisMonthCount}
          </p>
        </div>
      </section>

      <section className="card space-y-4">
        {reports.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {t("reportNoRecords")}
          </p>
        )}

        <DataTable
          columns={reportColumns}
          data={reports}
          editable={false}
          exportFilename="reports"
        />
      </section>
    </div>
  );
}
