import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  superadminuser: "Super Admin Staff",
  admin: "Admin",
  adminuser: "Admin Staff",
  hotel: "Hotel",
  hoteluser: "Hotel Staff",
  restaurant: "Restaurant",
  restaurantuser: "Restaurant Staff",
  activity: "Activity",
  activityuser: "Activity Staff",
};

function formatPermission(permission) {
  return permission.replace(/:/g, " - ").replace(/_/g, " ");
}

export default function DashboardControlPanelDetails({
  title,
  subtitle,
  stats = [],
}) {
  const { t } = useLanguage();
  const currentUser = useSelector((s) => s.auth.user);
  const permissions = currentUser?.permissions || [];

  const roleLabel = useMemo(
    () => ROLE_LABELS[currentUser?.role] || currentUser?.role || "-",
    [currentUser?.role],
  );

  return (
    <section className="card relative overflow-hidden">
      <div className="pointer-events-none absolute -left-20 -top-16 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
              {t("dashboard")}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
              {t("role")}
            </p>
            <p className="mt-1 font-semibold capitalize text-slate-800 dark:text-slate-100">
              {roleLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              {permissions.length} {t("permissions")}
            </p>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          {t("dashboardReadOnlyNotice")}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200">
            {t("permissions")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {permissions.length === 0 ? (
              <span className="text-sm text-slate-500 dark:text-slate-300">
                {t("noPermissions")}
              </span>
            ) : (
              permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-1 text-xs font-semibold capitalize tracking-wide text-cyan-900 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-100"
                >
                  {formatPermission(perm)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
