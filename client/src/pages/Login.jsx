import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../store/services/api";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate, Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const ROLE_PATH = {
  super_admin: "/super-admin",
  admin: "/admin",
  hotel: "/hotel",
  restaurant: "/restaurant",
  activity: "/activity",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, lang, dir } = useLanguage();
  const currentUser = useSelector((s) => s.auth.user);

  // Already authenticated → redirect to own dashboard
  if (currentUser) {
    return <Navigate to={ROLE_PATH[currentUser.role] || "/"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials(res));
      const role = res.user.role;
      navigate(ROLE_PATH[role] || "/");
    } catch (err) {
      // error is already captured in the `error` state from useLoginMutation
    }
  };

  return (
    <div className="login-page" dir={dir}>
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-2 items-center">
        <div className="hidden lg:block space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 bg-white shadow-sm">
            <img
              src="/logo.png?v=2"
              alt="Travky.com"
              className="w-28 h-28 rounded-full object-cover"
              onError={(e) => {
                e.target.src = "/logo.svg?v=2";
              }}
            />
            <div>
              <div className="logo-title">Travky.com</div>
              <div className="logo-subtitle">{t("unifiedBookingPlatform")}</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 leading-tight">
            {t("controlBooking")}
            <span className="text-brand-primary">{t("inOnePlace")}</span>.
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">{t("fiveDesc")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="text-sm text-slate-400">{t("security")}</div>
              <div className="text-lg font-semibold">JWT + RBAC</div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-400">{t("dashboards")}</div>
              <div className="text-lg font-semibold">{t("tailoredViews")}</div>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-header mb-2">
            <img
              src="/logo.png?v=2"
              alt="Travky.com"
              className="w-32 h-32 object-cover"
              onError={(e) => {
                e.target.src = "/logo.svg?v=2";
              }}
            />
            <div>
              <div className="logo-title">Travky.com</div>
              <div className="logo-subtitle">{t("signInToContinue")}</div>
            </div>
          </div>

          <h2 className="login-title">{t("welcomeBack")}</h2>
          <p className="login-subtext">{t("loginSubtext")}</p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              className="input"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div style={{ position: "relative" }}>
              <input
                className="input"
                placeholder={t("passwordPlaceholder")}
                type={showpassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{
                  paddingRight: dir === "rtl" ? "14px" : "44px",
                  paddingLeft: dir === "rtl" ? "44px" : "14px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowpassword((v) => !v)}
                style={{
                  position: "absolute",
                  top: "50%",
                  [dir === "rtl" ? "left" : "right"]: "12px",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#94a3b8",
                  fontSize: 18,
                  lineHeight: 1,
                }}
                tabIndex={-1}
              >
                {showpassword ? "🙈" : "👁️"}
              </button>
            </div>
            {error && (
              <div className="input-error">
                {error.data?.message || t("loginFailed")}
              </div>
            )}
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t("signingIn") : t("loginBtn")}
            </button>
          </form>

          <div className="login-accounts">
            <div className="login-accounts-title">{t("sampleAccounts")}</div>
            <ul>
              <li>Super Admin — super@arkedia.com / Password123!</li>
              <li>Admin Company — admin@arkedia.com / Password123!</li>
              <li>Hotel Manager — hotel@arkedia.com / Password123!</li>
              <li>
                Restaurant Manager — restaurant@arkedia.com / Password123!
              </li>
              <li>Activity Manager — activity@arkedia.com / Password123!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
