import { Plus } from "lucide-react";

/**
 * Reusable Add/primary-action button.
 *
 * Props:
 *   onClick   – click handler
 *   children  – button label
 *   icon      – optional lucide element to replace the default Plus icon (pass null to hide icon)
 *   size      – "sm" | "md" (default "md")
 *   className – extra Tailwind classes
 */
export default function AddButton({ onClick, children, icon, size = "md", className = "", ...rest }) {
  const pad   = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const iconEl = icon !== undefined ? icon : <Plus size={size === "sm" ? 13 : 15} />;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 ${pad} ${className}`}
      style={{ backgroundColor: "var(--sidebar-active-text)" }}
      {...rest}
    >
      {iconEl}
      {children && <span>{children}</span>}
    </button>
  );
}
