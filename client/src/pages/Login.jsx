import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api, useLoginMutation } from "../store/services/api";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Eye, EyeOff, AlertCircle, X } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";

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
      <PublicNavbar />

      {/* Page shell */}
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          paddingTop: "64px",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 1rem 2rem",
          fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
        }}
      >
        {/* Card */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 40px rgba(0,0,0,.1)",
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <img src="/logo_transparent.png" alt="Travky"
              style={{ height: "60px", margin: "0 auto 0.5rem", display: "block" }} />
          </div>

          {/* Heading */}
          <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#1e3a5f", marginBottom: "0.4rem" }}>
            تسجيل الدخول
          </h1>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.75rem" }}>
            مرحباً! سجل دخولك لإدارة حجوزاتك
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.875rem", color: "#374151", marginBottom: "0.4rem", textAlign: "right" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "0.7rem 1rem", borderRadius: "0.875rem",
                  border: "1.5px solid #e5e7eb", backgroundColor: "#f9fafb",
                  fontSize: "0.9rem", color: "#111827", outline: "none",
                  direction: "ltr", textAlign: "right",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#1e3a5f"; e.target.style.boxShadow = "0 0 0 3px rgba(30,58,95,.1)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "#e5e7eb";  e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <a href="#" style={{ fontSize: "0.8rem", color: "#1e3a5f", textDecoration: "none" }}>نسيت كلمة المرور؟</a>
                <label style={{ fontWeight: 700, fontSize: "0.875rem", color: "#374151" }}>كلمة المرور</label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showpassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "0.7rem 1rem", paddingLeft: "3rem",
                    borderRadius: "0.875rem",
                    border: "1.5px solid #e5e7eb", backgroundColor: "#f9fafb",
                    fontSize: "0.9rem", color: "#111827", outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#1e3a5f"; e.target.style.boxShadow = "0 0 0 3px rgba(30,58,95,.1)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#e5e7eb";  e.target.style.boxShadow = "none"; }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowpassword((v) => !v)}
                  style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0.2rem" }}>
                  {showpassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", padding: "0.85rem", borderRadius: "0.875rem",
                backgroundColor: "#1e3a5f", color: "white", fontWeight: 700,
                fontSize: "1rem", border: "none", cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري الدخول...
                </>
              ) : "تسجيل الدخول"}
            </button>
          </form>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginTop: "1.25rem" }}>
            ليس لديك حساب؟{" "}
            <a href="#" style={{ color: "#1e3a5f", fontWeight: 700, textDecoration: "none" }}>إنشاء حساب</a>
          </p>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #f3f4f6", margin: "1.25rem 0" }} />

          {/* Partner login */}
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
            هل أنت شريك؟{" "}
            <a href="#" style={{ color: "#1e3a5f", fontWeight: 700, textDecoration: "none" }}>تسجيل دخول كشريك</a>
          </p>
        </div>
      </div>

      {/* Error modal */}
      {showErrorModal && error && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "rgba(0,0,0,.5)" }} dir="rtl">
          <div style={{ backgroundColor: "white", borderRadius: "1.25rem", boxShadow: "0 20px 60px rgba(0,0,0,.2)", width: "100%", maxWidth: "360px", padding: "1.75rem", position: "relative", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <AlertCircle size={24} style={{ color: "#ef4444" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#111827", marginBottom: "0.5rem" }}>فشل تسجيل الدخول</h3>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.25rem" }}>
              {error?.data?.message || "تحقق من بريدك الإلكتروني وكلمة المرور وحاول مجدداً."}
            </p>
            <button onClick={() => setShowErrorModal(false)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.875rem", backgroundColor: "#1e3a5f", color: "white", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              إغلاق
            </button>
            <button onClick={() => setShowErrorModal(false)}
              style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}