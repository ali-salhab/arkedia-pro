import { useDispatch, useSelector } from "react-redux";
import { Bell, Trash2, X } from "lucide-react";
import {
  removeNotification,
  clearNotifications,
} from "../store/slices/notificationsSlice";

export default function Notifications() {
  const dispatch = useDispatch();
  const notifications = useSelector((s) => s.notifications.items);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""}
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => dispatch(clearNotifications())}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-base font-medium">No notifications yet</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm px-4 py-3 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                {n.title && (
                  <p className="text-sm font-semibold text-slate-700">
                    {n.title}
                  </p>
                )}
                <p className="text-sm text-slate-600">
                  {n.message || n.text || JSON.stringify(n)}
                </p>
                {n.id && (
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(n.id).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => dispatch(removeNotification(n.id))}
                className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
