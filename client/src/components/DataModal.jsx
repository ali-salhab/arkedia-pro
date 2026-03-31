import { useState, useRef } from "react";
import { Database, Download, Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle, Loader } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL } from "../utils/apiBase";

const API = API_BASE_URL;

/**
 * DataModal – reusable Excel export / import / template modal.
 *
 * Props:
 *   resourcePath  – API path segment, e.g. "rooms", "hotels"
 *   resourceLabel – Human label shown in text, e.g. "Rooms"
 *   onImported    – Optional callback fired with { imported, skipped } after import
 */
export default function DataModal({ resourcePath, resourceLabel, onImported }) {
  const { t, dir } = useLanguage();
  const token = useSelector((s) => s.auth.accessToken);
  const fileRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const close = () => {
    setOpen(false);
    setPhase("idle");
    setMessage("");
    setDetail(null);
  };

  /* ─── Export ─────────────────────────────────────────────────────────────── */
  const handleExport = async () => {
    setPhase("loading");
    setMessage(t("dataModal_exporting") || "Exporting…");
    try {
      const res = await fetch(`${API}/${resourcePath}/export`, { headers });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resourcePath}_export.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setPhase("success");
      setMessage(t("dataModal_exportSuccess") || "Data exported successfully!");
    } catch (e) {
      setPhase("error");
      setMessage(t("dataModal_exportError") || "Export failed. Please try again.");
    }
  };

  /* ─── Template ───────────────────────────────────────────────────────────── */
  const handleTemplate = async () => {
    setPhase("loading");
    setMessage(t("dataModal_downloading") || "Downloading template…");
    try {
      const res = await fetch(`${API}/${resourcePath}/template`, { headers });
      if (!res.ok) throw new Error("Template failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resourcePath}_template.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setPhase("success");
      setMessage(t("dataModal_templateSuccess") || "Template downloaded!");
    } catch (e) {
      setPhase("error");
      setMessage(t("dataModal_templateError") || "Download failed. Please try again.");
    }
  };

  /* ─── Import ─────────────────────────────────────────────────────────────── */
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhase("loading");
    setMessage(t("dataModal_importing") || "Importing…");
    setDetail(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/${resourcePath}/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Import failed");
      setPhase("success");
      setMessage(
        (t("dataModal_importSuccess") || "Import complete!") +
          ` ${json.imported} ${t("dataModal_rowsImported") || "rows imported"}.`
      );
      if (json.errors?.length) {
        setDetail(json.errors);
      }
      if (typeof onImported === "function") onImported(json);
    } catch (err) {
      setPhase("error");
      setMessage(err.message || (t("dataModal_importError") || "Import failed."));
    }

    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title={t("dataModal_manage") || "Data Management"}
        className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-700 flex items-center justify-center transition-all shadow-sm"
      >
        <Database size={17} strokeWidth={2} />
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ direction: dir }}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={close} />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Database size={18} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-black text-[15px] text-slate-900 dark:text-white">
                    {t("dataModal_title") || "Data Management"}
                  </h3>
                  <p className="text-[12px] text-slate-400 font-medium">{resourceLabel}</p>
                </div>
              </div>
              <button
                onClick={close}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 space-y-2.5">
              {/* Export */}
              <button
                disabled={phase === "loading"}
                onClick={handleExport}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-blue-50/80 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 group transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                  <Upload size={16} className="text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                </div>
                <div className="text-start">
                  <p className="font-bold text-[13px] text-slate-900 dark:text-white">
                    {t("dataModal_export") || "Export Data"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {t("dataModal_exportDesc") || "Download all records as .xlsx"}
                  </p>
                </div>
              </button>

              {/* Import */}
              <label
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-emerald-50/80 hover:border-emerald-300 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700 group transition-all cursor-pointer ${phase === "loading" ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                  <Download size={16} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                </div>
                <div className="text-start flex-1">
                  <p className="font-bold text-[13px] text-slate-900 dark:text-white">
                    {t("dataModal_import") || "Import Data"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {t("dataModal_importDesc") || "Upload an .xlsx file to bulk-add records"}
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>

              {/* Template */}
              <button
                disabled={phase === "loading"}
                onClick={handleTemplate}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-amber-50/80 hover:border-amber-300 dark:hover:bg-amber-900/20 dark:hover:border-amber-700 group transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60 transition-colors">
                  <FileSpreadsheet size={16} className="text-amber-600 dark:text-amber-400" strokeWidth={2} />
                </div>
                <div className="text-start">
                  <p className="font-bold text-[13px] text-slate-900 dark:text-white">
                    {t("dataModal_template") || "Download Template"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {t("dataModal_templateDesc") || "Get a blank Excel template to fill in"}
                  </p>
                </div>
              </button>
            </div>

            {/* Status banner */}
            {phase !== "idle" && (
              <div className={`mx-5 mb-5 px-4 py-3 rounded-xl flex items-start gap-3 text-[12px] font-medium ${
                phase === "loading"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : phase === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}>
                {phase === "loading" && <Loader size={15} className="animate-spin mt-0.5 shrink-0" />}
                {phase === "success" && <CheckCircle size={15} className="mt-0.5 shrink-0" />}
                {phase === "error" && <AlertTriangle size={15} className="mt-0.5 shrink-0" />}
                <div>
                  <p>{message}</p>
                  {detail && detail.length > 0 && (
                    <ul className="mt-1.5 space-y-1 opacity-80">
                      {detail.slice(0, 5).map((e, i) => (
                        <li key={i}>Row {e.row}: {e.message}</li>
                      ))}
                      {detail.length > 5 && <li>…and {detail.length - 5} more</li>}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
