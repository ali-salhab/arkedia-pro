import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionWrapper from "./components/PermissionWrapper";
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
import SuperAdminIconsPage from "./pages/SuperAdminIcons";
import UserFormPage from "./pages/forms/UserFormPage";
import BookingFormPage from "./pages/forms/BookingFormPage";
import RoomFormPage from "./pages/forms/RoomFormPage";
import HotelMainDetailsStep from "./pages/hotel-details/MainDetailsStep";
import HotelDescriptionStep from "./pages/hotel-details/DescriptionStep";
import HotelIconsStep from "./pages/hotel-details/IconsStep";
import HotelPolicyStep from "./pages/hotel-details/PolicyStep";
import HotelPhotosStep from "./pages/hotel-details/PhotosStep";
import HotelDetailsView from "./pages/hotel-details/HotelDetailsView";
import RestaurantMainDetailsStep from "./pages/restaurant-details/MainDetailsStep";
import RestaurantDescriptionStep from "./pages/restaurant-details/DescriptionStep";
import RestaurantPolicyStep from "./pages/restaurant-details/PolicyStep";
import RestaurantPhotosStep from "./pages/restaurant-details/PhotosStep";
import RestaurantDetailsView from "./pages/restaurant-details/RestaurantDetailsView";
import ActivityMainDetailsStep from "./pages/activity-details/MainDetailsStep";
import ActivityDescriptionStep from "./pages/activity-details/DescriptionStep";
import ActivityIconsStep from "./pages/activity-details/IconsStep";
import ActivityPolicyStep from "./pages/activity-details/PolicyStep";
import ActivityPhotosStep from "./pages/activity-details/PhotosStep";
import ActivityDetailsView from "./pages/activity-details/ActivityDetailsView";
import HotelChannelManagerPage from "./pages/hotel-channel/ChannelManagerPage";
import GuestGroupsPage from "./pages/hotel-channel/travky/GuestGroupsPage";
import MealPlansPage from "./pages/hotel-channel/travky/MealPlansPage";
import PeriodsPage from "./pages/hotel-channel/travky/PeriodsPage";
import SupplementsPage from "./pages/hotel-channel/travky/SupplementsPage";
import RefundPoliciesPage from "./pages/hotel-channel/travky/RefundPoliciesPage";
import RoomTypesPage from "./pages/hotel-channel/travky/RoomTypesPage";
import RatesPage from "./pages/hotel-channel/travky/RatesPage";
import AvailabilityPage from "./pages/hotel-channel/travky/AvailabilityPage";
import ApiSettingsPage from "./pages/hotel-channel/travky/ApiSettingsPage";

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

function PermissionRoute({ permission, element, fallbackTo = "/hotel" }) {
  return (
    <PermissionWrapper
      permission={permission}
      fallback={<Navigate to={fallbackTo} replace />}
    >
      {element}
    </PermissionWrapper>
  );
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
          <Route
            path="/super-admin/icons"
            element={<DashboardRoute element={<SuperAdminIconsPage />} />}
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
          <Route
            path="/hotel/channel-manager"
            element={
              <Navigate
                to="/hotel/channel-manager/travky/guest-groups"
                replace
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/guest-groups"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="guest_groups:view"
                    element={<GuestGroupsPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/meal-plans"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="meal_plans:view"
                    element={<MealPlansPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/periods"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="periods:view"
                    element={<PeriodsPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/supplements"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="supplements:view"
                    element={<SupplementsPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/refund-policies"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="refund_policies:view"
                    element={<RefundPoliciesPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/rooms"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="channel_manager_rooms:view"
                    element={<RoomTypesPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/rates"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="rates:view"
                    element={<RatesPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/availability"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="availability:view"
                    element={<AvailabilityPage />}
                  />
                }
              />
            }
          />
          <Route
            path="/hotel/channel-manager/travky/api-settings"
            element={<DashboardRoute element={<ApiSettingsPage />} />}
          />
          <Route
            path="/hotel/channel-manager/external"
            element={
              <DashboardRoute
                element={
                  <PermissionRoute
                    permission="channel_manager_external:view"
                    element={
                      <HotelChannelManagerPage sectionKey="channel_manager_external" />
                    }
                  />
                }
              />
            }
          />
        </Route>

        <Route
          element={<ProtectedRoute roles={["restaurant", "restaurantuser"]} />}
        >
          <Route
            path="/restaurant"
            element={<DashboardRoute element={<RestaurantDashboard />} />}
          />
          <Route
            path="/restaurant/details"
            element={<Navigate to="/restaurant/details/main" replace />}
          />
          <Route
            path="/restaurant/details/main"
            element={<DashboardRoute element={<RestaurantMainDetailsStep />} />}
          />
          <Route
            path="/restaurant/details/description"
            element={<DashboardRoute element={<RestaurantDescriptionStep />} />}
          />
          <Route
            path="/restaurant/details/policy"
            element={<DashboardRoute element={<RestaurantPolicyStep />} />}
          />
          <Route
            path="/restaurant/details/photos"
            element={<DashboardRoute element={<RestaurantPhotosStep />} />}
          />
          <Route
            path="/restaurant/details/view"
            element={<DashboardRoute element={<RestaurantDetailsView />} />}
          />
        </Route>

        <Route
          element={<ProtectedRoute roles={["activity", "activityuser"]} />}
        >
          <Route
            path="/activity"
            element={<DashboardRoute element={<ActivityDashboard />} />}
          />
          <Route
            path="/activity/details"
            element={<Navigate to="/activity/details/main" replace />}
          />
          <Route
            path="/activity/details/main"
            element={<DashboardRoute element={<ActivityMainDetailsStep />} />}
          />
          <Route
            path="/activity/details/description"
            element={<DashboardRoute element={<ActivityDescriptionStep />} />}
          />
          <Route
            path="/activity/details/icons"
            element={<DashboardRoute element={<ActivityIconsStep />} />}
          />
          <Route
            path="/activity/details/policy"
            element={<DashboardRoute element={<ActivityPolicyStep />} />}
          />
          <Route
            path="/activity/details/photos"
            element={<DashboardRoute element={<ActivityPhotosStep />} />}
          />
          <Route
            path="/activity/details/view"
            element={<DashboardRoute element={<ActivityDetailsView />} />}
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
