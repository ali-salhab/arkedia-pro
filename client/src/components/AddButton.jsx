import { Plus } from "lucide-react";


export default function AddButton({ onClick, children, icon, size = "md", className = "", ...rest }) {
  const pad   = size === "sm" ? "px-6 py-1.5 text-lg" : "px-4 py-2.5 text-sm";
  const iconEl = icon !== undefined ? icon : <Plus size={size === "sm" ? 15 : 19} />;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex  bg-green-400  border-lg text-white items-center gap-2 rounded-lg font-semibold  transition-opacity hover:opacity-90 active:scale-95 ${pad} ${className}`}

      {...rest}
    >
      {iconEl}
      {children && <span>{children}</span>}
    </button>
  );
}
