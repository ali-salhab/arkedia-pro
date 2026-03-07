import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../store/services/api";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials(res));
      const role = res.user.role;
      const pathMap = {
        super_admin: "/super-admin",
        admin: "/admin",
        hotel: "/hotel",
        restaurant: "/restaurant",
        activity: "/activity",
      };
      navigate(pathMap[role] || "/");
    } catch (err) {
      // error is already captured in the `error` state from useLoginMutation
    }
  };

  return (
    <div className="login-page">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-2 items-center">
        <div className="hidden lg:block space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 bg-white shadow-sm">
            <div className="logo-circle">TRAvi</div>
            <div>
              <div className="logo-title">Travik.com</div>
              <div className="logo-subtitle">Unified Booking Platform</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 leading-tight">
            Control every booking
            <span className="text-brand-primary"> in one place</span>.
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Five dashboards for super admin, admin company, hotels, restaurants,
            and activities. Role-based access, permissions-aware sidebar, and
            real-time data.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="text-sm text-slate-400">Security</div>
              <div className="text-lg font-semibold">JWT + RBAC</div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-400">Dashboards</div>
              <div className="text-lg font-semibold">5 tailored views</div>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-header mb-4">
            <div className="logo-circle">Travi..</div>
            <div>
              <div className="logo-title">Travik.com</div>
              <div className="logo-subtitle">Sign in to continue</div>
            </div>
          </div>

          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtext">
            Manage bookings across hotels, restaurants, and activities.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && (
              <div className="input-error">
                {error.data?.message || "Login failed"}
              </div>
            )}
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="login-accounts">
            <div className="login-accounts-title">Sample accounts</div>
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
