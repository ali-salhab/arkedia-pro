import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  // Redirect to role-specific dashboard
  const roleRoutes = {
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

  const redirectTo = roleRoutes[user?.role] || "/login";

  return <Navigate to={redirectTo} replace />;
}
