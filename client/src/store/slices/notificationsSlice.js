import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [] },
  reducers: {
    addNotification: (state, { payload }) => {
      state.items.unshift({ id: Date.now(), read: false, ...payload });
      if (state.items.length > 100) state.items.length = 100;
    },
    removeNotification: (state, { payload }) => {
      state.items = state.items.filter((n) => n.id !== payload);
    },
    markNotificationRead: (state, { payload }) => {
      const item = state.items.find((n) => n.id === payload);
      if (item) item.read = true;
    },
    markNotificationUnread: (state, { payload }) => {
      const item = state.items.find((n) => n.id === payload);
      if (item) item.read = false;
    },
    markAllNotificationsRead: (state) => {
      state.items.forEach((item) => {
        item.read = true;
      });
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  addNotification,
  removeNotification,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  clearNotifications,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
