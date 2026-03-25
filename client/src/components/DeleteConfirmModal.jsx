import { useLanguage } from "../context/LanguageContext";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  if (!open) return null;

  const defaultTitle = isRtl ? "تأكيد الحذف" : "Confirm Delete";
  const defaultMessage = isRtl
    ? "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
    : "Are you sure you want to delete this item? This action cannot be undone.";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: "90%",
          maxWidth: 440,
          background: "var(--bg-surface)",
          borderRadius: 16,
          overflow: "hidden",
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle
              size={22}
              strokeWidth={2}
              style={{ color: "var(--danger)", flexShrink: 0 }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {title || defaultTitle}
            </h3>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
            style={{ flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {message || defaultMessage}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "0 24px 20px",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--bg-raised)",
              color: "var(--text-secondary)",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#f87171" : "#ef4444",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            {loading
              ? isRtl
                ? "جاري الحذف..."
                : "Deleting..."
              : isRtl
                ? "حذف"
                : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
