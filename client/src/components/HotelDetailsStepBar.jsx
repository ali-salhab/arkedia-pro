import { useNavigate, useLocation } from "react-router-dom";
import {
  FileSearch,
  AlignLeft,
  Tag,
  ShieldCheck,
  Images,
  Check,
} from "lucide-react";

const STEPS = [
  { label: "Main Details", path: "/hotel/details/main", Icon: FileSearch },
  { label: "Description", path: "/hotel/details/description", Icon: AlignLeft },
  { label: "Icons", path: "/hotel/details/icons", Icon: Tag },
  { label: "Policy", path: "/hotel/details/policy", Icon: ShieldCheck },
  { label: "Photos", path: "/hotel/details/photos", Icon: Images },
];

export default function HotelDetailsStepBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentIdx = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div className="flex justify-center mb-10 select-none overflow-x-auto py-1">
      <div className="flex items-start">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isReachable = idx <= currentIdx;
          const { Icon } = step;

          return (
            <div key={step.path} className="flex items-start">
              {/* connector line */}
              {idx > 0 && (
                <div
                  className="h-[2px] w-10 sm:w-14 mt-[19px]"
                  style={{
                    backgroundColor:
                      idx <= currentIdx
                        ? "var(--sidebar-active-text)"
                        : "var(--border)",
                    transition: "background-color 0.4s",
                  }}
                />
              )}

              {/* circle + label */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isReachable && navigate(step.path)}
                  disabled={!isReachable}
                  title={step.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 outline-none"
                  style={{
                    backgroundColor:
                      isDone || isCurrent
                        ? "var(--sidebar-active-text)"
                        : "var(--bg-raised)",
                    border: `2px solid ${isDone || isCurrent ? "var(--sidebar-active-text)" : "var(--border)"}`,
                    color: isDone || isCurrent ? "#fff" : "var(--text-muted)",
                    cursor: isReachable ? "pointer" : "not-allowed",
                    boxShadow: isCurrent
                      ? "0 0 0 5px rgba(59,130,246,0.18)"
                      : "none",
                    transform: isCurrent ? "scale(1.12)" : "scale(1)",
                  }}
                >
                  {isDone ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <Icon size={16} strokeWidth={2} />
                  )}
                </button>
                <span
                  className="mt-2 text-center text-[10px] sm:text-[11px] leading-tight max-w-[62px]"
                  style={{
                    color: isCurrent
                      ? "var(--sidebar-active-text)"
                      : isDone
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                    fontWeight: isCurrent ? 700 : isDone ? 500 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
