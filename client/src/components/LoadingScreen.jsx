import { useLanguage } from "../context/LanguageContext";
import { SkeletonStatGrid, SkeletonTable } from "./SkeletonLoader";

export default function LoadingScreen({
  label,
  statCount = 3,
  tableRows = 5,
  tableCols = 4,
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4" style={{ padding: 24 }}>
      <div className="card">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
          {label || t("loading")}
        </p>
      </div>
      <SkeletonStatGrid count={statCount} />
      <SkeletonTable rows={tableRows} cols={tableCols} />
    </div>
  );
}
