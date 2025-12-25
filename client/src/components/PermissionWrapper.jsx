import { useSelector } from "react-redux";

export default function PermissionWrapper({
  permission,
  children,
  fallback = null,
}) {
  const perms = useSelector((s) => s.auth.user?.permissions || []);
  if (permission && !perms.includes(permission)) return fallback;
  return children;
}
