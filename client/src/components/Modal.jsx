import { useLanguage } from "../context/LanguageContext";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 2000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Dedicated error modal for API/save errors with animated shake */
export function ErrorModal({ open, onClose, title, message }) {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 2100,
        backdropFilter: "blur(6px)",
        animation: "fade-up 0.2s ease-out both",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "28px 32px",
          maxWidth: 440,
          width: "90vw",
          boxShadow: "0 20px 60px rgba(220,38,38,0.18)",
          border: "1.5px solid #fca5a5",
          animation: "fade-up 0.25s ease-out both",
        }}
      >
        {/* Red icon header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: "#dc2626",
            }}
          >
            {title || t("error")}
          </h3>
        </div>
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 0",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}

