import { useEffect, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { getSocket } from "../hooks/useSocket";
import { setCredentials } from "../store/slices/authSlice";
import { useRefreshMutation } from "../store/services/api";
import {
  addNotification,
  clearNotifications,
} from "../store/slices/notificationsSlice";

const getNotificationTime = () => new Date().toISOString();

export default function MainLayout({ children }) {
  const { dir, t } = useLanguage();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const notifications = useSelector((s) => s.notifications.items);
  const user = useSelector((s) => s.auth.user);
  const refreshToken = useSelector((s) => s.auth.refreshToken);
  const dispatch = useDispatch();
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Connect socket and listen for permission updates
  useEffect(() => {
    if (!user?._id && !user?.sub) return;
    const userId = user._id || user.sub;
    const socket = getSocket();

    if (!socket.connected) socket.connect();
    socket.emit("join", userId);

    const handlePermissionsUpdated = async ({ permissions }) => {
      // Push notification
      dispatch(
        addNotification({
          type: "permissions",
          titleKey: "notif_permissionsUpdated",
          bodyKey: "notif_permissionsUpdatedBody",
          time: getNotificationTime(),
        }),
      );
      // Update Redux so PermissionWrapper re-evaluates in real-time
      dispatch(
        setCredentials({
          user: { ...user, permissions },
        }),
      );

      // Keep backend auth checks aligned by rotating tokens after permission changes.
      if (refreshToken) {
        try {
          const refreshedSession = await refresh({ refreshToken }).unwrap();
          dispatch(setCredentials(refreshedSession));
        } catch {
          // Keep optimistic UI permissions even if token refresh fails.
        }
      }
    };

    const handleIconRequested = ({ label, hotelName, time }) => {
      dispatch(
        addNotification({
          type: "icon_requested",
          titleKey: "notif_iconRequestedTitle",
          bodyKey: "notif_iconRequestedBody",
          params: { hotelName, label },
          time: time ? new Date(time).toISOString() : getNotificationTime(),
        }),
      );
    };

    const handleIconDesigned = ({ label }) => {
      dispatch(
        addNotification({
          type: "icon_designed",
          titleKey: "notif_iconDesignedTitle",
          bodyKey: "notif_iconDesignedBody",
          params: { label },
          time: getNotificationTime(),
        }),
      );
    };

    socket.on("permissions:updated", handlePermissionsUpdated);
    socket.on("icon:requested", handleIconRequested);
    socket.on("icon:designed", handleIconDesigned);
    return () => {
      socket.off("permissions:updated", handlePermissionsUpdated);
      socket.off("icon:requested", handleIconRequested);
      socket.off("icon:designed", handleIconDesigned);
    };
  }, [dispatch, refresh, refreshToken, t, user]);

  const clearAllNotifications = useCallback(
    () => dispatch(clearNotifications()),
    [dispatch],
  );

  return (
    <>
      <Navbar
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
        notifications={notifications}
        onClearNotifications={clearAllNotifications}
      />
      <div className="layout" dir={dir}>
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <div className="content">
          <div className="app-orb -left-20 top-24 h-52 w-52 bg-cyan-300/20" />
          <div
            className="app-orb right-8 top-0 h-44 w-44 bg-blue-300/20"
            style={{ animationDelay: "1.6s" }}
          />
          <div
            className="app-orb -bottom-12 left-1/2 h-64 w-64 bg-indigo-300/20"
            style={{ animationDelay: "0.8s" }}
          />

          <div className="page-shell">{children}</div>
        </div>
      </div>
    </>
  );
}
