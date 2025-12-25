import { NavLink } from "react-router-dom";
import { useGetSidebarQuery } from "../store/services/api";

export default function Sidebar() {
  const { data, isLoading } = useGetSidebarQuery();

  if (isLoading) return <div className="sidebar">Loading...</div>;
  const menu = data?.menu || [];

  return (
    <div className="sidebar">
      {menu.map((item) => (
        <NavLink
          key={item.route}
          to={item.route}
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          {item.name}
        </NavLink>
      ))}
    </div>
  );
}
