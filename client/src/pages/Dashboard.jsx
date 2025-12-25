import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  // Redirect to role-specific dashboard
  const roleRoutes = {
    super_admin: "/super-admin",
    admin: "/admin",
    hotel: "/hotel",
    restaurant: "/restaurant",
    activity: "/activity",
  };

  const redirectTo = roleRoutes[user?.role] || "/login";

  return <Navigate to={redirectTo} replace />;
}
