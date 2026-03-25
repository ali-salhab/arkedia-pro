import { useNavigate, useLocation } from "react-router-dom";
import {
  FileSearch,
  AlignLeft,
  Tag,
  ShieldCheck,
  Images,
  Check,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const STEP_STORAGE_KEYS = [
  "hotel_details_main",
  "hotel_details_description",
  "hotel_details_icons",
  "hotel_details_policy",
  "hotel_details_photos",
];

export default function HotelDetailsStepBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const steps = [
    {
      label: t("hotelStepMain"),
      path: "/hotel/details/main",
      Icon: FileSearch,
    },
    {
      label: t("hotelStepDescription"),
      path: "/hotel/details/description",
      Icon: AlignLeft,
    },
    { label: t("hotelStepIcons"), path: "/hotel/details/icons", Icon: Tag },
    {
      label: t("hotelStepPolicy"),
      path: "/hotel/details/policy",
      Icon: ShieldCheck,
    },
    {
      label: t("hotelStepPhotos"),
      path: "/hotel/details/photos",
      Icon: Images,
    },
  ];

  const currentIdx = steps.findIndex((step) => step.path === pathname);

  return (
    <div className="mb-8 flex justify-center overflow-x-auto px-1 py-1 select-none lg:mb-10">
      <div className="flex min-w-max items-start px-1 lg:px-2">
        {steps.map((step, idx) => {
          const isDone = !!sessionStorage.getItem(STEP_STORAGE_KEYS[idx]);
          const isCurrent = idx === currentIdx;
          const isReachable =
            idx === 0 || !!sessionStorage.getItem(STEP_STORAGE_KEYS[idx - 1]);
          const { Icon } = step;

          return (
            <div key={step.path} className="flex items-start">
              {/* connector line */}
              {idx > 0 && (
                <div
                  className="mt-[22px] h-[1px] w-7 sm:w-12 lg:mt-[26px] lg:w-20"
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
                  className="flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-full transition-all duration-300 outline-none"
                  style={{
                    backgroundColor:
                      isDone || isCurrent
                        ? "var(--sidebar-active-text)"
                        : "var(--bg-raised)",
                    border: `2px solid ${isDone || isCurrent ? "var(--sidebar-active-text)" : "var(--border)"}`,
                    color: isDone || isCurrent ? "#fff" : "var(--text-muted)",
                    cursor: isReachable ? "pointer" : "not-allowed",
                    boxShadow: isCurrent
                      ? "0 0 0 5px rgba(29,78,216,0.15)"
                      : "none",
                    transform: isCurrent ? "scale(1.12)" : "scale(1)",
                  }}
                >
                  {isDone ? (
                    <Check size={16} strokeWidth={3} className="lg:hidden" />
                  ) : (
                    <Icon size={16} strokeWidth={2} className="lg:hidden" />
                  )}
                  {isDone ? (
                    <Check
                      size={22}
                      strokeWidth={3}
                      className="hidden lg:block"
                    />
                  ) : (
                    <Icon
                      size={22}
                      strokeWidth={2}
                      className="hidden lg:block"
                    />
                  )}
                </button>
                <span
                  className="mt-2 max-w-[58px] text-center text-[10px] leading-tight sm:max-w-[62px] sm:text-[11px] lg:max-w-[88px] lg:text-sm"
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
