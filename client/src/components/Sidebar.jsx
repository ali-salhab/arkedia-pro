import { NavLink } from "react-router-dom";
import { useGetSidebarQuery } from "../store/services/api";
import { useLanguage } from "../context/LanguageContext";

const SIDEBAR_NAME_MAP = {
  Dashboard: "dashboard",
  Users: "users",
  "All Hotels": "allHotels",
  "All Restaurants": "allRestaurants",
  "All Activities": "allActivities",
  "All Bookings": "allBookings",
  "Rooms/Tables": "roomsTables",
  Finance: "finance",
  Reports: "reports",
  Settings: "settings",
};

export default function Sidebar() {
  const { data, isLoading } = useGetSidebarQuery();
  const { t } = useLanguage();

  if (isLoading) return <div className="sidebar">{t("loading")}</div>;
  const menu = data?.menu || [];

  return (
    <div className="sidebar">
      {menu.map((item) => (
        <NavLink
          key={item.route}
          to={item.route}
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          {t(SIDEBAR_NAME_MAP[item.name] || item.name)}
        </NavLink>
      ))}
    </div>
  );
}
