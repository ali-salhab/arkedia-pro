import DataTable from "../components/DataTable";
import { useLanguage } from "../context/LanguageContext";
import { useGetFinanceQuery } from "../store/services/api";

const BOOKING_TYPE_LABELS = {
  hotel: "bk_typeHotel",
  restaurant: "bk_typeRestaurant",
  activity: "bk_typeActivity",
};

const PAYMENT_STATUS_LABELS = {
  unpaid: "bk_psUnpaid",
  partial: "bk_psPartial",
  paid: "bk_psPaid",
  refunded: "bk_psRefunded",
};

export default function FinancePage() {
  const { data, isLoading, error } = useGetFinanceQuery();
  const { t, lang } = useLanguage();
  const finance = Array.isArray(data) ? data : [];

  const formatCurrency = (value, currency = "USD") =>
    new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const getTypeLabel = (type) =>
    type === "expense" ? t("expenses") : t("revenue");

  const getStatusLabel = (status) =>
    t(PAYMENT_STATUS_LABELS[status] || "status");

  const getDescription = (row) => {
    const bookingTypeLabel = t(
      BOOKING_TYPE_LABELS[row.bookingType] || "bookings",
    );
    return [bookingTypeLabel, row.reference, row.customerName]
      .filter(Boolean)
      .join(" - ");
  };

  const financeColumns = [
    {
      key: "type",
      label: t("type"),
      render: (value) => getTypeLabel(value),
    },
    {
      key: "description",
      label: t("description"),
      render: (_value, row) => getDescription(row),
    },
    {
      key: "amount",
      label: t("amount"),
      render: (value, row) => formatCurrency(value, row.currency),
    },
    {
      key: "date",
      label: t("date"),
      render: (value) => formatDate(value),
    },
    {
      key: "status",
      label: t("status"),
      render: (value) => getStatusLabel(value),
    },
  ];

  if (isLoading) {
    return (
      <div className="card text-center text-sm text-slate-500">
        {t("loadingFinanceData")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center text-sm font-medium text-rose-500">
        {t("errorLoadingFinance")}
      </div>
    );
  }

  const totalRevenue = finance
    .filter((entry) => entry.type === "revenue")
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const totalExpense = finance
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const primaryCurrency = finance[0]?.currency || "USD";

  return (
    <div className="space-y-6">
      <section className="card space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {t("financeOverview")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {t("financeSubtitle")}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-emerald-800">
            {t("revenue")}
          </h2>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalRevenue, primaryCurrency)}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-rose-800">
            {t("expenses")}
          </h2>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {formatCurrency(totalExpense, primaryCurrency)}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-sky-800">
            {t("netProfit")}
          </h2>
          <p className="mt-2 text-2xl font-bold text-sky-600">
            {formatCurrency(totalRevenue - totalExpense, primaryCurrency)}
          </p>
        </div>
      </section>

      <section className="card space-y-4">
        {finance.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {t("financeNoRecords")}
          </p>
        )}
        <DataTable
          columns={financeColumns}
          data={finance}
          editable={false}
          exportFilename="finance"
        />
      </section>
    </div>
  );
}
