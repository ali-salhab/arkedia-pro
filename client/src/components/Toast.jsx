import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = { info: "#2563eb", success: "#16a34a", error: "#dc2626" };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "12px 16px",
        background: colors[type] || colors.info,
        color: "white",
        borderRadius: 8,
      }}
    >
      {message}
    </div>
  );
}
