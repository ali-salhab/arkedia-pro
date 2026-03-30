import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { ErrorModal } from "./Modal";
import {
  usePublicClientLoginMutation,
  usePublicClientSignupMutation,
} from "../store/services/api";

const INITIAL_LOGIN_FORM = {
  email: "",
  password: "",
};

const INITIAL_SIGNUP_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function buildLoginErrors(form) {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = "البريد الإلكتروني مطلوب";
  } else if (!validateEmail(form.email.trim())) {
    errors.email = "أدخل بريداً إلكترونياً صحيحاً";
  }

  if (!form.password) {
    errors.password = "كلمة المرور مطلوبة";
  }

  return errors;
}

function buildSignupErrors(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "الاسم مطلوب";
  } else if (form.name.trim().length < 2) {
    errors.name = "الاسم يجب أن يحتوي على حرفين على الأقل";
  }

  if (!form.email.trim()) {
    errors.email = "البريد الإلكتروني مطلوب";
  } else if (!validateEmail(form.email.trim())) {
    errors.email = "أدخل بريداً إلكترونياً صحيحاً";
  }

  if (!form.password) {
    errors.password = "كلمة المرور مطلوبة";
  } else if (form.password.length < 6) {
    errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "تأكيد كلمة المرور مطلوب";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "كلمتا المرور غير متطابقتين";
  }

  return errors;
}

export default function PublicAuthModal({
  open,
  mode,
  onClose,
  onModeChange,
  onAuthenticated,
}) {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [signupForm, setSignupForm] = useState(INITIAL_SIGNUP_FORM);
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [loginMessage, setLoginMessage] = useState("");
  const [signupErrorMessage, setSignupErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [publicLogin, { isLoading: isLoginLoading }] =
    usePublicClientLoginMutation();
  const [publicSignup, { isLoading: isSignupLoading }] =
    usePublicClientSignupMutation();

  useEffect(() => {
    if (!open) {
      setLoginErrors({});
      setSignupErrors({});
      setLoginMessage("");
      setSignupErrorMessage("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  const isSignupMode = mode === "signup";
  const title = useMemo(
    () => (isSignupMode ? "إنشاء حساب عميل" : "تسجيل دخول العميل"),
    [isSignupMode],
  );

  if (!open) return null;

  const closeModal = () => {
    setLoginMessage("");
    setSignupErrorMessage("");
    onClose();
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = buildLoginErrors(loginForm);
    setLoginErrors(nextErrors);
    setLoginMessage("");

    if (Object.keys(nextErrors).length > 0) return;

    try {
      const response = await publicLogin({
        email: loginForm.email.trim(),
        password: loginForm.password,
      }).unwrap();

      onAuthenticated(response.client);
      closeModal();
    } catch (error) {
      setLoginMessage(
        error?.data?.message || "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.",
      );
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = buildSignupErrors(signupForm);
    setSignupErrors(nextErrors);
    setSignupErrorMessage("");

    if (Object.keys(nextErrors).length > 0) return;

    try {
      const response = await publicSignup({
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
      }).unwrap();

      onAuthenticated(response.client);
      closeModal();
    } catch (error) {
      setSignupErrorMessage(
        error?.data?.message || "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.",
      );
    }
  };

  return (
    <>
      <div
        dir="rtl"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2100,
          background: "rgba(7, 15, 33, 0.55)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            borderRadius: "28px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,252,0.98) 100%)",
            boxShadow: "0 32px 90px rgba(14, 28, 59, 0.26)",
            padding: "1.25rem",
            border: "1px solid rgba(157, 173, 201, 0.32)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <p style={{ margin: 0, color: "#8a97af", fontSize: "0.8rem", fontWeight: 700 }}>
                Travky Account
              </p>
              <h2 style={{ margin: "0.35rem 0 0", fontSize: "1.5rem", fontWeight: 900, color: "#101828" }}>
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeModal}
              style={iconButtonStyle}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "0.6rem",
              background: "#edf2f9",
              borderRadius: "18px",
              padding: "0.35rem",
              marginBottom: "1.2rem",
            }}
          >
            <button
              type="button"
              onClick={() => onModeChange("login")}
              style={tabButtonStyle(!isSignupMode)}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              style={tabButtonStyle(isSignupMode)}
            >
              إنشاء حساب
            </button>
          </div>

          {isSignupMode ? (
            <form onSubmit={handleSignupSubmit}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>الاسم</label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="الاسم الكامل"
                  style={inputStyle(Boolean(signupErrors.name))}
                />
                {signupErrors.name ? <span style={errorTextStyle}>{signupErrors.name}</span> : null}
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                  style={inputStyle(Boolean(signupErrors.email))}
                  dir="ltr"
                />
                {signupErrors.email ? <span style={errorTextStyle}>{signupErrors.email}</span> : null}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem" }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>كلمة المرور</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={(event) =>
                        setSignupForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="6 أحرف أو أكثر"
                      style={inputStyle(Boolean(signupErrors.password))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      style={passwordToggleStyle}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {signupErrors.password ? <span style={errorTextStyle}>{signupErrors.password}</span> : null}
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>تأكيد كلمة المرور</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={signupForm.confirmPassword}
                      onChange={(event) =>
                        setSignupForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="أعد كتابة كلمة المرور"
                      style={inputStyle(Boolean(signupErrors.confirmPassword))}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      style={passwordToggleStyle}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {signupErrors.confirmPassword ? (
                    <span style={errorTextStyle}>{signupErrors.confirmPassword}</span>
                  ) : null}
                </div>
              </div>

              <button type="submit" disabled={isSignupLoading} style={submitButtonStyle}>
                {isSignupLoading ? <LoaderCircle size={18} className="animate-spin" /> : null}
                <span>{isSignupLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                  style={inputStyle(Boolean(loginErrors.email))}
                  dir="ltr"
                />
                {loginErrors.email ? <span style={errorTextStyle}>{loginErrors.email}</span> : null}
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>كلمة المرور</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="أدخل كلمة المرور"
                    style={inputStyle(Boolean(loginErrors.password))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    style={passwordToggleStyle}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {loginErrors.password ? <span style={errorTextStyle}>{loginErrors.password}</span> : null}
              </div>

              {loginMessage ? (
                <div style={messageBoxStyle}>{loginMessage}</div>
              ) : null}

              <button type="submit" disabled={isLoginLoading} style={submitButtonStyle}>
                {isLoginLoading ? <LoaderCircle size={18} className="animate-spin" /> : null}
                <span>{isLoginLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}</span>
              </button>
            </form>
          )}

          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e7ecf3",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <p style={{ margin: 0, color: "#667085", fontSize: "0.88rem" }}>
              هل أنت شريك وتريد الدخول إلى لوحة التحكم؟
            </p>
            <button
              type="button"
              onClick={() => {
                closeModal();
                navigate("/login");
              }}
              style={partnerButtonStyle}
            >
              تسجيل دخول كشريك
            </button>
          </div>
        </div>
      </div>

      <ErrorModal
        open={Boolean(signupErrorMessage)}
        onClose={() => setSignupErrorMessage("")}
        title="تعذر إنشاء الحساب"
        message={signupErrorMessage}
      />
    </>
  );
}

const iconButtonStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  border: "1px solid #d5dceb",
  background: "white",
  cursor: "pointer",
  color: "#475467",
  fontSize: "1rem",
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  marginBottom: "0.9rem",
};

const labelStyle = {
  color: "#344054",
  fontSize: "0.88rem",
  fontWeight: 700,
};

const inputStyle = (hasError) => ({
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "16px",
  border: `1.5px solid ${hasError ? "#f97066" : "#d7deea"}`,
  background: "#ffffff",
  padding: "0.9rem 1rem",
  fontFamily: "inherit",
  fontSize: "0.95rem",
  color: "#101828",
  outline: "none",
  boxShadow: hasError ? "0 0 0 4px rgba(249, 112, 102, 0.12)" : "none",
});

const passwordToggleStyle = {
  position: "absolute",
  left: "0.8rem",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#667085",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const errorTextStyle = {
  color: "#d92d20",
  fontSize: "0.8rem",
  fontWeight: 600,
};

const messageBoxStyle = {
  marginBottom: "0.9rem",
  padding: "0.85rem 1rem",
  borderRadius: "14px",
  background: "#fff1f1",
  color: "#b42318",
  fontSize: "0.88rem",
  fontWeight: 600,
};

const submitButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #12386a 0%, #0f5ea6 100%)",
  color: "white",
  padding: "0.95rem 1rem",
  fontFamily: "inherit",
  fontSize: "0.96rem",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.45rem",
  marginTop: "0.35rem",
};

const partnerButtonStyle = {
  border: "1px solid #0f4c8d",
  borderRadius: "999px",
  background: "white",
  color: "#0f4c8d",
  padding: "0.75rem 1rem",
  fontFamily: "inherit",
  fontWeight: 800,
  cursor: "pointer",
};

const tabButtonStyle = (active) => ({
  border: "none",
  borderRadius: "14px",
  background: active ? "white" : "transparent",
  color: active ? "#101828" : "#667085",
  padding: "0.82rem 0.9rem",
  fontFamily: "inherit",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: active ? "0 10px 30px rgba(18, 56, 106, 0.08)" : "none",
});