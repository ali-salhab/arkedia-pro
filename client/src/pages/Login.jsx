import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api, useLoginMutation } from "../store/services/api";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate, Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Eye, EyeOff, AlertCircle, X } from "lucide-react";

const ROLE_PATH = {
  super_admin: "/super-admin",
  superadminuser: "/super-admin",
  admin: "/admin",
  adminuser: "/admin",
  hotel: "/hotel",
  hoteluser: "/hotel",
  restaurant: "/restaurant",
  restaurantuser: "/restaurant",
  activity: "/activity",
  activityuser: "/activity",
};

const FEATURES = [
  { icon: "🏨", ar: "فنادق", en: "Hotels" },
  { icon: "✈️", ar: "رحلات", en: "Flights" },
  { icon: "🌴", ar: "عطلات", en: "Holidays" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, lang, dir } = useLanguage();
  const currentUser = useSelector((s) => s.auth.user);

  if (currentUser) {
    return <Navigate to={ROLE_PATH[currentUser.role] || "/"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrorModal(false);
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(api.util.resetApiState());
      dispatch(setCredentials(res));
      navigate(ROLE_PATH[res.user.role] || "/");
    } catch {
      setShowErrorModal(true);
    }
  };

  /* ── inline keyframe styles injected once ── */
  const css = `
    @keyframes lf {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-12px); }
    }
    @keyframes lfu {
      from { opacity:0; transform:translateY(18px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes lgp {
      0%,100% { opacity:.7; }
      50%      { opacity:1; }
    }
    @keyframes lspin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes lb1 {
      0%,100% { transform:translate(0,0) scale(1); }
      50%     { transform:translate(28px,-18px) scale(1.07); }
    }
    @keyframes lb2 {
      0%,100% { transform:translate(0,0) scale(1); }
      50%     { transform:translate(-22px,16px) scale(1.1); }
    }
    .lf   { animation: lf   4.5s ease-in-out infinite; }
    .lgp  { animation: lgp  3s   ease-in-out infinite; }
    .lb1  { animation: lb1  13s  ease-in-out infinite; }
    .lb2  { animation: lb2  17s  ease-in-out infinite; }
    .lfu1 { animation: lfu .5s ease both; }
    .lfu2 { animation: lfu .5s .08s ease both; }
    .lfu3 { animation: lfu .5s .16s ease both; }
    .lfu4 { animation: lfu .5s .24s ease both; }
    .lfu5 { animation: lfu .5s .32s ease both; }
    .lspin-slow { animation: lspin 18s linear infinite; }
    .lspin-rev  { animation: lspin 24s linear infinite reverse; }
  `;

  return (
    <>
      <style>{css}</style>

      {/* ╔══════════════════════════════════════════╗
          ║  BACKDROP                                ║
          ╚══════════════════════════════════════════╝ */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg,#03061a 0%,#080f2a 50%,#050918 100%)",
        }}
        dir={dir}
      >
        {/* Large backdrop blobs */}
        <div
          className="lb1 absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(67,97,238,.18) 0%,transparent 70%)",
          }}
        />
        <div
          className="lb2 absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(99,60,220,.14) 0%,transparent 70%)",
          }}
        />

        {/* ╔══════════════════════════════════════════╗
            ║  MODAL CARD                              ║
            ╚══════════════════════════════════════════╝ */}
        <div
          className="relative w-full max-w-[860px] h-full md:h-auto md:max-h-[94dvh] flex flex-col md:flex-row rounded-3xl overflow-hidden"
          style={{
            boxShadow:
              "0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06)",
          }}
        >
          {/* ─────────────────────────────────────────
              BRANDING PANEL  right/top
          ───────────────────────────────────────── */}
          <div
            className="relative flex flex-col items-center justify-center overflow-hidden order-1 md:order-last
            w-full md:w-[44%] px-8 py-4 md:py-0"
            style={{
              background:
                "linear-gradient(145deg,#0b1540 0%,#0a1230 40%,#060d22 100%)",
            }}
          >
            {/* Diagonal stripe overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -55deg,
                  rgba(255,255,255,.022) 0px,
                  rgba(255,255,255,.022) 1px,
                  transparent 1px,
                  transparent 32px
                )`,
              }}
            />

            {/* Inner blobs */}
            <div
              className="lb1 absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle,rgba(67,97,238,.3) 0%,transparent 65%)",
              }}
            />
            <div
              className="lb2 absolute -bottom-16 -left-16 w-72 h-72 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle,rgba(99,60,220,.22) 0%,transparent 65%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* ── Logo ── */}
              <div className="lf mb-2 md:mb-8 relative">
                {/* Spinning outer ring 1 */}
                <div
                  className="lspin-slow absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    width: "calc(100% + 28px)",
                    height: "calc(100% + 28px)",
                    top: "-14px",
                    left: "-14px",
                    border: "1.5px dashed rgba(99,130,255,.25)",
                  }}
                />
                {/* Spinning outer ring 2 */}
                <div
                  className="lspin-rev absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    width: "calc(100% + 52px)",
                    height: "calc(100% + 52px)",
                    top: "-26px",
                    left: "-26px",
                    border: "1px dashed rgba(99,130,255,.12)",
                  }}
                />

                {/* Logo circle */}
                <div
                  className="lgp relative rounded-full overflow-hidden
                  w-16 h-16 md:w-40 md:h-40
                  flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg,#0d1e50,#08122e)",
                    border: "2px solid rgba(99,130,255,.3)",
                    boxShadow:
                      "0 0 0 8px rgba(67,97,238,.08), 0 0 60px 8px rgba(67,97,238,.25)",
                  }}
                >
                  <img
                    src="/logo_transparent.png"
                    alt="Travky.com"
                    className="w-[82%] h-[82%] object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Headline — desktop only */}
              <h2 className="hidden md:block text-2xl font-extrabold text-white leading-snug mb-2">
                {t("controlBooking")}
                <span
                  className="block mt-1 text-transparent bg-clip-text"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#6889ff,#a78bfa)",
                  }}
                >
                  {t("inOnePlace")}
                </span>
              </h2>

              <p className="hidden md:block text-sm text-blue-200/60 leading-relaxed mb-8 max-w-[220px]">
                {t("fiveDesc")}
              </p>

              {/* Feature chips — desktop only */}
              <div className="hidden md:flex gap-2.5 flex-wrap justify-center">
                {FEATURES.map(({ icon, ar, en }) => (
                  <div
                    key={ar}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full text-white/80 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 cursor-default"
                    style={{
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.1)",
                    }}
                  >
                    <span className="text-base">{icon}</span>
                    <span>{lang === "ar" ? ar : en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────
              FORM PANEL  left/bottom
          ───────────────────────────────────────── */}
          <div
            className="flex-1 flex items-center justify-center px-6 py-5 md:px-10 md:py-12 order-2 md:order-first"
            style={{ background: "#ffffff" }}
          >
            <div className="w-full max-w-[340px]">
              {/* Heading */}
              <div className="lfu1 mb-4">
                <h1
                  className="text-[1.65rem] font-black leading-tight mb-1.5"
                  style={{ color: "#0f172a" }}
                >
                  {t("welcomeBack")}
                </h1>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  {t("loginSubtext")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div className="lfu2">
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: "#374151" }}
                    htmlFor="email"
                  >
                    {t("emailPlaceholder")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                    style={{
                      border: "1.5px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#0f172a",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4361ee";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(67,97,238,.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Password */}
                <div className="lfu3">
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: "#374151" }}
                    htmlFor="password"
                  >
                    {t("passwordPlaceholder")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      type={showpassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                      style={{
                        border: "1.5px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#0f172a",
                        paddingRight: dir === "rtl" ? "16px" : "48px",
                        paddingLeft: dir === "rtl" ? "48px" : "16px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#4361ee";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(67,97,238,.12)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowpassword((v) => !v)}
                      className="absolute top-1/2 -translate-y-1/2 p-1 transition-colors"
                      style={{
                        [dir === "rtl" ? "left" : "right"]: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      {showpassword ? (
                        <EyeOff size={18} strokeWidth={1.8} />
                      ) : (
                        <Eye size={18} strokeWidth={1.8} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="lfu4 pt-0.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[.98] disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg,#4361ee,#7b2ff7)",
                      boxShadow: "0 6px 22px -4px rgba(67,97,238,.55)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading)
                        e.currentTarget.style.boxShadow =
                          "0 8px 28px -4px rgba(67,97,238,.75)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 6px 22px -4px rgba(67,97,238,.55)";
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("signingIn")}...
                      </>
                    ) : (
                      t("loginBtn")
                    )}
                  </button>
                </div>
              </form>

              {/* Demo credentials */}
              <div className="lfu5 mt-4 pt-4 border-t border-slate-100">
                <p
                  className="text-[11px] uppercase tracking-widest font-semibold text-center mb-2.5"
                  style={{ color: "#94a3b8" }}
                >
                  {t("sampleAccounts")}
                </p>
                <div
                  className="rounded-xl px-4 py-3 font-mono text-xs text-center space-y-0.5"
                  style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
                >
                  <p className="font-semibold" style={{ color: "#1e293b" }}>
                    super@arkedia.com
                  </p>
                  <p style={{ color: "#64748b" }}>Password123!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /modal card */}
      </div>
      {/* /backdrop */}

      {/* ── Error Modal ── */}
      {showErrorModal && error && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          dir={dir}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <div className="p-6 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "#fee2e2" }}
              >
                <AlertCircle className="w-6 h-6" style={{ color: "#ef4444" }} />
              </div>
              <h3
                className="text-base font-bold mb-1"
                style={{ color: "#0f172a" }}
              >
                {t("loginFailed") || "Login Failed"}
              </h3>
              <p className="text-sm mb-5" style={{ color: "#64748b" }}>
                {error?.data?.message ||
                  "Please check your credentials and try again."}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-colors"
                style={{ background: "#0f172a" }}
              >
                {t("close") || "Close"}
              </button>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
              style={{ color: "#94a3b8" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
