import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import { useRefreshMutation } from "./store/services/api";
import { setCredentials } from "./store/slices/authSlice";
import LoginPage from "./pages/Login";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/Settings";
import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import AdminsPage from "./pages/Admins";
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
import GlobalErrorModal from "./components/GlobalErrorModal";
import NotificationsPage from "./pages/Notifications";
import UserFormPage from "./pages/forms/UserFormPage";
import BookingFormPage from "./pages/forms/BookingFormPage";
import RoomFormPage from "./pages/forms/RoomFormPage";
import HotelMainDetailsStep from "./pages/hotel-details/MainDetailsStep";
import HotelDescriptionStep from "./pages/hotel-details/DescriptionStep";
import HotelIconsStep from "./pages/hotel-details/IconsStep";
import HotelPolicyStep from "./pages/hotel-details/PolicyStep";
import HotelPhotosStep from "./pages/hotel-details/PhotosStep";
import HotelDetailsView from "./pages/hotel-details/HotelDetailsView";

const ALL_ROLES = [
  "super_admin",
  "superadminuser",
  "admin",
  "adminuser",
  "hotel",
  "hoteluser",
  "restaurant",
  "restaurantuser",
  "activity",
  "activityuser",
];

// Fires once on app boot to pull fresh permissions/user from DB into Redux.
// This ensures that if an admin changed your permissions, you see them immediately
// on next page load — without needing to log out and back in.
function AuthSync() {
  const refreshToken = useSelector((s) => s.auth.refreshToken);
  const dispatch = useDispatch();
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    if (refreshToken) {
      refresh({ refreshToken })
        .unwrap()
        .then((res) => dispatch(setCredentials(res)))
        .catch(() => {}); // silent — user keeps their cached session
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function DashboardRoute({ element }) {
  return <MainLayout>{element}</MainLayout>;
}

export default function App() {
  return (
    <>
      <AuthSync />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Role-specific dashboards */}
        <Route
          element={<ProtectedRoute roles={["super_admin", "superadminuser"]} />}
        >
          <Route
            path="/super-admin"
            element={<DashboardRoute element={<SuperAdminDashboard />} />}
          />
        </Route>

        <Route element={<ProtectedRoute roles={["admin", "adminuser"]} />}>
          <Route
            path="/admin"
            element={<DashboardRoute element={<AdminDashboard />} />}
          />
        </Route>

        <Route element={<ProtectedRoute roles={["hotel", "hoteluser"]} />}>
          <Route
            path="/hotel"
            element={<DashboardRoute element={<HotelDashboard />} />}
          />
          <Route
            path="/hotel/details"
            element={<Navigate to="/hotel/details/main" replace />}
          />
          <Route
            path="/hotel/details/main"
            element={<DashboardRoute element={<HotelMainDetailsStep />} />}
          />
          <Route
            path="/hotel/details/description"
            element={<DashboardRoute element={<HotelDescriptionStep />} />}
          />
          <Route
            path="/hotel/details/icons"
            element={<DashboardRoute element={<HotelIconsStep />} />}
          />
          <Route
            path="/hotel/details/policy"
            element={<DashboardRoute element={<HotelPolicyStep />} />}
          />
          <Route
            path="/hotel/details/photos"
            element={<DashboardRoute element={<HotelPhotosStep />} />}
          />
          <Route
            path="/hotel/details/view"
            element={<DashboardRoute element={<HotelDetailsView />} />}
          />
        </Route>

        <Route
          element={<ProtectedRoute roles={["restaurant", "restaurantuser"]} />}
        >
          <Route
            path="/restaurant"
            element={<DashboardRoute element={<RestaurantDashboard />} />}
          />
        </Route>

        <Route
          element={<ProtectedRoute roles={["activity", "activityuser"]} />}
        >
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
            path="/admins"
            element={<DashboardRoute element={<AdminsPage />} />}
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
          <Route
            path="/notifications"
            element={<DashboardRoute element={<NotificationsPage />} />}
          />
          <Route
            path="/users/new"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/users/:id/edit"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/admins/new"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/admins/:id/edit"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/hotels/new"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/hotels/:id/edit"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/restaurants/new"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/restaurants/:id/edit"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/activities/new"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/activities/:id/edit"
            element={<DashboardRoute element={<UserFormPage />} />}
          />
          <Route
            path="/bookings/new"
            element={<DashboardRoute element={<BookingFormPage />} />}
          />
          <Route
            path="/bookings/:id/edit"
            element={<DashboardRoute element={<BookingFormPage />} />}
          />
          <Route
            path="/rooms/new"
            element={<DashboardRoute element={<RoomFormPage />} />}
          />
          <Route
            path="/rooms/:id/edit"
            element={<DashboardRoute element={<RoomFormPage />} />}
          />
        </Route>

        {/* Root → smart redirect based on auth state */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GlobalErrorModal />
    </>
  );
}
