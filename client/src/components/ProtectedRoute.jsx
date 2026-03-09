import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ROLE_PATH = {
  super_admin: "/super-admin",
  admin: "/admin",
  hotel: "/hotel",
  restaurant: "/restaurant",
  activity: "/activity",
};

export default function ProtectedRoute({ roles }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  // Wrong role → redirect to user's own dashboard instead of login
  if (roles && !roles.includes(user.role))
    return <Navigate to={ROLE_PATH[user.role] || "/login"} replace />;
  return <Outlet />;
}
