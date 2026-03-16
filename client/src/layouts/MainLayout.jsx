import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { getSocket } from "../hooks/useSocket";
import { setCredentials } from "../store/slices/authSlice";

export default function MainLayout({ children }) {
  const { dir, t } = useLanguage();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

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

    const handlePermissionsUpdated = ({ permissions }) => {
      // Push notification
      setNotifications((prev) => [
        {
          type: "permissions",
          title: t("notif_permissionsUpdated"),
          body: t("notif_permissionsUpdatedBody"),
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      // Update Redux so PermissionWrapper re-evaluates in real-time
      dispatch(
        setCredentials({
          user: { ...user, permissions },
          accessToken: undefined,
          refreshToken: undefined,
        }),
      );
    };

    socket.on("permissions:updated", handlePermissionsUpdated);
    return () => {
      socket.off("permissions:updated", handlePermissionsUpdated);
    };
  }, [user?._id, user?.sub]);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <>
      <Navbar
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
        notifications={notifications}
        onClearNotifications={clearNotifications}
      />
      <div className="layout h-screen pt-[60px]" dir={dir}>
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
