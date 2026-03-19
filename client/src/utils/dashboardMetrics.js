export function toArr(data) {
  return Array.isArray(data) ? data : data?.items || [];
}

function getLocale(lang) {
  return lang === "ar" ? "ar-EG" : "en-US";
}

export function getMonthLabels(lang = "en") {
  const locale = getLocale(lang);
  return Array.from({ length: 12 }, (_, monthIndex) =>
    new Date(2026, monthIndex, 1).toLocaleString(locale, { month: "short" }),
  );
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pickDate(item, fields) {
  for (const field of fields) {
    const parsed = parseDate(item?.[field]);
    if (parsed) return parsed;
  }
  return null;
}

export function buildMonthlySeries(
  items = [],
  dateFields = ["createdAt"],
  valueField = null,
  lang = "en",
) {
  const fields = Array.isArray(dateFields) ? dateFields : [dateFields];
  const months = getMonthLabels(lang).map((month) => ({ month, value: 0 }));

  items.forEach((item) => {
    const date = pickDate(item, fields);
    if (!date) return;

    const monthIndex = date.getMonth();
    const delta = valueField ? Number(item?.[valueField]) || 0 : 1;
    months[monthIndex].value += delta;
  });

  return months;
}

export function calcTrend(monthData = []) {
  const currentMonth = new Date().getMonth();
  const current = Number(monthData[currentMonth]?.value || 0);
  const previous = Number(monthData[(currentMonth - 1 + 12) % 12]?.value || 0);

  if (previous === 0) {
    return {
      trend: current > 0 ? "+100%" : "+0%",
      positive: true,
    };
  }

  const pct = ((current - previous) / previous) * 100;
  const rounded = pct.toFixed(1);
  return {
    trend: `${pct >= 0 ? "+" : ""}${rounded}%`,
    positive: pct >= 0,
  };
}

export function formatCompactCurrency(
  amount = 0,
  lang = "en",
  currency = "USD",
) {
  const locale = getLocale(lang);
  const safeAmount = Number(amount) || 0;

  try {
    const compact = Math.abs(safeAmount) >= 1000;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(safeAmount);
  } catch {
    if (Math.abs(safeAmount) >= 1e6)
      return `$${(safeAmount / 1e6).toFixed(1)}M`;
    if (Math.abs(safeAmount) >= 1e3)
      return `$${(safeAmount / 1e3).toFixed(0)}K`;
    return `$${Math.round(safeAmount)}`;
  }
}

export function takeLastMonths(series = [], count = 7) {
  if (!Array.isArray(series) || series.length === 0) return [];
  return series.slice(Math.max(0, series.length - count));
}
