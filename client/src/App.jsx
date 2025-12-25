import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/Login";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/Settings";
import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import HotelsPage from "./pages/Hotels";
import RestaurantsPage from "./pages/Restaurants";
import ActivitiesPage from "./pages/Activities";
import BookingsPage from "./pages/Bookings";
import RoomsPage from "./pages/Rooms";
import FinancePage from "./pages/Finance";
import ReportsPage from "./pages/Reports";
import SuperAdminDashboard from "./dashboards/SuperAdmin";
import AdminDashboard from "./dashboards/Admin";
import HotelDashboard from "./dashboards/Hotel";
import RestaurantDashboard from "./dashboards/Restaurant";
import ActivityDashboard from "./dashboards/Activity";

const ALL_ROLES = ["super_admin", "admin", "hotel", "restaurant", "activity"];

function DashboardRoute({ element }) {
  return <MainLayout>{element}</MainLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Role-specific dashboards */}
      <Route element={<ProtectedRoute roles={["super_admin"]} />}>
        <Route
          path="/super-admin"
          element={<DashboardRoute element={<SuperAdminDashboard />} />}
        />
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route
          path="/admin"
          element={<DashboardRoute element={<AdminDashboard />} />}
        />
      </Route>

      <Route element={<ProtectedRoute roles={["hotel"]} />}>
        <Route
          path="/hotel"
          element={<DashboardRoute element={<HotelDashboard />} />}
        />
      </Route>

      <Route element={<ProtectedRoute roles={["restaurant"]} />}>
        <Route
          path="/restaurant"
          element={<DashboardRoute element={<RestaurantDashboard />} />}
        />
      </Route>

      <Route element={<ProtectedRoute roles={["activity"]} />}>
        <Route
          path="/activity"
          element={<DashboardRoute element={<ActivityDashboard />} />}
        />
      </Route>

      {/* Common pages - permission-based access handled by backend */}
      <Route element={<ProtectedRoute roles={ALL_ROLES} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/users"
          element={<DashboardRoute element={<UsersPage />} />}
        />
        <Route
          path="/hotels"
          element={<DashboardRoute element={<HotelsPage />} />}
        />
        <Route
          path="/restaurants"
          element={<DashboardRoute element={<RestaurantsPage />} />}
        />
        <Route
          path="/activities"
          element={<DashboardRoute element={<ActivitiesPage />} />}
        />
        <Route
          path="/bookings"
          element={<DashboardRoute element={<BookingsPage />} />}
        />
        <Route
          path="/rooms"
          element={<DashboardRoute element={<RoomsPage />} />}
        />
        <Route
          path="/finance"
          element={<DashboardRoute element={<FinancePage />} />}
        />
        <Route
          path="/reports"
          element={<DashboardRoute element={<ReportsPage />} />}
        />
        <Route
          path="/settings"
          element={<DashboardRoute element={<SettingsPage />} />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
