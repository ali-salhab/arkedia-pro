import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCheck,
  Filter,
  Lock,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import {
  removeNotification,
  clearNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
} from "../store/slices/notificationsSlice";
import { useLanguage } from "../context/LanguageContext";

const COPY = {
  en: {
    title: "Notifications",
    countSingular: "notification",
    countPlural: "notifications",
    clearAll: "Clear all",
    markAllRead: "Mark all as read",
    emptyTitle: "No notifications yet",
    emptyBody: "You're all caught up!",
    filtersTitle: "Filters",
    categoriesTitle: "Categories",
    statusesTitle: "Status",
    allNotifications: "All",
    unreadOnly: "Unread",
    readOnly: "Read",
    resultsLabel: "results",
    activeFiltersLabel: "active filters",
    remove: "Remove",
    markRead: "Mark as read",
    markUnread: "Mark as unread",
    emptyFilteredTitle: "No notifications match these filters",
    emptyFilteredBody: "Try another category or status.",
    typeLabels: {
      all: "All",
      permissions: "Permissions",
      icon_requested: "Icon Requests",
      icon_designed: "Ready Icons",
      other: "Other",
    },
  },
  ar: {
    title: "الإشعارات",
    countSingular: "إشعار",
    countPlural: "إشعارات",
    clearAll: "مسح الكل",
    markAllRead: "تحديد الكل كمقروء",
    emptyTitle: "لا توجد إشعارات بعد",
    emptyBody: "كل شيء محدث لديك.",
    filtersTitle: "الفلاتر",
    categoriesTitle: "الفئات",
    statusesTitle: "الحالة",
    allNotifications: "الكل",
    unreadOnly: "غير مقروء",
    readOnly: "مقروء",
    resultsLabel: "نتيجة",
    activeFiltersLabel: "فلاتر مفعلة",
    remove: "حذف",
    markRead: "تحديد كمقروء",
    markUnread: "تحديد كغير مقروء",
    emptyFilteredTitle: "لا توجد إشعارات تطابق هذه الفلاتر",
    emptyFilteredBody: "جرّب فئة أو حالة مختلفة.",
    typeLabels: {
      all: "الكل",
      permissions: "الصلاحيات",
      icon_requested: "طلبات الأيقونات",
      icon_designed: "أيقونات جاهزة",
      other: "أخرى",
    },
  },
};

const TYPE_META = {
  permissions: {
    icon: Lock,
    accent: "#2563eb",
    bg: "rgba(37, 99, 235, 0.12)",
  },
  icon_requested: {
    icon: Tag,
    accent: "#d97706",
    bg: "rgba(217, 119, 6, 0.14)",
  },
  icon_designed: {
    icon: Sparkles,
    accent: "#059669",
    bg: "rgba(5, 150, 105, 0.14)",
  },
  other: {
    icon: Bell,
    accent: "#6b7280",
    bg: "rgba(107, 114, 128, 0.12)",
  },
};

function resolveNotification(notification, t) {
  if (notification.type === "permissions") {
    return {
      title: t("notif_permissionsUpdated"),
      body: t("notif_permissionsUpdatedBody"),
    };
  }

  if (notification.type === "icon_requested") {
    const legacyMatch = String(notification.body || "").match(
      /^(.*?) requested a new icon: "(.*)"$/,
    );
    const params = notification.params || {
      hotelName: legacyMatch?.[1] || "",
      label: legacyMatch?.[2] || "",
    };

    return {
      title: t("notif_iconRequestedTitle", params),
      body: t("notif_iconRequestedBody", params),
    };
  }

  if (notification.type === "icon_designed") {
    const legacyMatch = String(notification.body || "").match(/"(.*)"/);
    const params = notification.params || {
      label: legacyMatch?.[1] || "",
    };

    return {
      title: t("notif_iconDesignedTitle", params),
      body: t("notif_iconDesignedBody", params),
    };
  }

  return {
    title: notification.titleKey
      ? t(notification.titleKey, notification.params)
      : notification.title,
    body: notification.bodyKey
      ? t(notification.bodyKey, notification.params)
      : notification.body || notification.message || notification.text || "",
  };
}

function formatNotificationDate(value, lang, fallback) {
  const source = value || fallback;
  if (!source) return "";

  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return String(source);

  return parsed.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
}

function getNotificationType(notification) {
  return TYPE_META[notification.type] ? notification.type : "other";
}

function FilterChip({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 flex-shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-medium whitespace-nowrap transition-all"
      style={{
        backgroundColor: active
          ? "var(--sidebar-active-text)"
          : "var(--bg-surface)",
        color: active ? "#fff" : "var(--text-secondary)",
        borderColor: active ? "var(--sidebar-active-text)" : "var(--border)",
      }}
    >
      <span>{children}</span>
      {typeof count === "number" && (
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{
            backgroundColor: active
              ? "rgba(255,255,255,0.18)"
              : "var(--brand-muted)",
            color: active ? "#fff" : "var(--sidebar-active-text)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function Notifications() {
  const dispatch = useDispatch();
  const notifications = useSelector((s) => s.notifications.items);
  const { lang, dir, t } = useLanguage();
  const copy = COPY[lang] || COPY.en;
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const normalizedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        normalizedType: getNotificationType(notification),
        content: resolveNotification(notification, t),
      })),
    [notifications, t],
  );

  const unreadCount = normalizedNotifications.filter(
    (item) => !item.read,
  ).length;

  const typeCounts = normalizedNotifications.reduce(
    (acc, item) => {
      acc[item.normalizedType] = (acc[item.normalizedType] || 0) + 1;
      return acc;
    },
    { all: normalizedNotifications.length },
  );

  const filteredNotifications = normalizedNotifications.filter(
    (notification) => {
      const typeMatches =
        typeFilter === "all" || notification.normalizedType === typeFilter;
      const statusMatches =
        statusFilter === "all" ||
        (statusFilter === "unread" && !notification.read) ||
        (statusFilter === "read" && notification.read);

      return typeMatches && statusMatches;
    },
  );

  const countLabel =
    filteredNotifications.length === 1 ? copy.countSingular : copy.countPlural;

  const typeChips = [
    { key: "all", label: copy.typeLabels.all, count: typeCounts.all || 0 },
    ...Object.keys(TYPE_META)
      .filter((type) => typeCounts[type] > 0)
      .map((type) => ({
        key: type,
        label: copy.typeLabels[type] || type,
        count: typeCounts[type] || 0,
      })),
  ];

  const statusChips = [
    {
      key: "all",
      label: copy.allNotifications,
      count: normalizedNotifications.length,
    },
    { key: "unread", label: copy.unreadOnly, count: unreadCount },
    {
      key: "read",
      label: copy.readOnly,
      count: normalizedNotifications.length - unreadCount,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5" dir={dir}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredNotifications.length} {countLabel}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsRead())}
                className="flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-600 transition-colors hover:border-blue-400 hover:text-blue-700"
              >
                <CheckCheck className="h-4 w-4" />
                {copy.markAllRead}
              </button>
            )}
            <button
              onClick={() => dispatch(clearNotifications())}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-500 transition-colors hover:border-red-400 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              {copy.clearAll}
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-base font-medium">{copy.emptyTitle}</p>
          <p className="text-sm">{copy.emptyBody}</p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Filter className="h-4 w-4" />
              {copy.filtersTitle}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {copy.categoriesTitle}
                </p>
                <div className="overflow-x-auto pb-2">
                  <div className="inline-flex min-w-max gap-2">
                    {typeChips.map((chip) => (
                      <FilterChip
                        key={chip.key}
                        active={typeFilter === chip.key}
                        onClick={() => setTypeFilter(chip.key)}
                        count={chip.count}
                      >
                        {chip.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {copy.statusesTitle}
                </p>
                <div className="overflow-x-auto pb-2">
                  <div className="inline-flex min-w-max gap-2">
                    {statusChips.map((chip) => (
                      <FilterChip
                        key={chip.key}
                        active={statusFilter === chip.key}
                        onClick={() => setStatusFilter(chip.key)}
                        count={chip.count}
                      >
                        {chip.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                  {filteredNotifications.length} {copy.resultsLabel}
                </span>
                {(typeFilter !== "all" || statusFilter !== "all") && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-600">
                    {copy.activeFiltersLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-slate-400">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Filter className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-base font-medium text-slate-600">
                {copy.emptyFilteredTitle}
              </p>
              <p className="text-sm">{copy.emptyFilteredBody}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const meta =
                  TYPE_META[notification.normalizedType] || TYPE_META.other;
                const TypeIcon = meta.icon;

                return (
                  <div
                    key={notification.id}
                    className="rounded-3xl border bg-white/90 p-4 shadow-sm backdrop-blur-sm"
                    style={{
                      borderColor: notification.read
                        ? "var(--border)"
                        : meta.accent,
                      boxShadow: notification.read
                        ? "0 8px 24px rgba(15, 23, 42, 0.05)"
                        : `0 10px 30px ${meta.bg}`,
                    }}
                  >
                    <div className="overflow-x-auto">
                      <div className="flex min-w-[640px] items-start gap-4">
                        <div
                          className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                          style={{
                            backgroundColor: meta.bg,
                            color: meta.accent,
                          }}
                        >
                          <TypeIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                              style={{
                                backgroundColor: meta.bg,
                                color: meta.accent,
                              }}
                            >
                              {copy.typeLabels[notification.normalizedType] ||
                                notification.normalizedType}
                            </span>
                            <span
                              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                              style={{
                                backgroundColor: notification.read
                                  ? "rgba(148, 163, 184, 0.12)"
                                  : "rgba(37, 99, 235, 0.12)",
                                color: notification.read
                                  ? "#64748b"
                                  : "#2563eb",
                              }}
                            >
                              {notification.read
                                ? copy.readOnly
                                : copy.unreadOnly}
                            </span>
                          </div>

                          {notification.content.title && (
                            <p className="text-sm font-semibold text-slate-800">
                              {notification.content.title}
                            </p>
                          )}
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {notification.content.body ||
                              JSON.stringify(notification)}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatNotificationDate(
                              notification.time,
                              lang,
                              notification.id,
                            )}
                          </p>
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-2">
                          <button
                            onClick={() =>
                              dispatch(
                                notification.read
                                  ? markNotificationUnread(notification.id)
                                  : markNotificationRead(notification.id),
                              )
                            }
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-800"
                          >
                            {notification.read
                              ? copy.markUnread
                              : copy.markRead}
                          </button>
                          <button
                            onClick={() =>
                              dispatch(removeNotification(notification.id))
                            }
                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:border-red-400 hover:text-red-700"
                          >
                            {copy.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
