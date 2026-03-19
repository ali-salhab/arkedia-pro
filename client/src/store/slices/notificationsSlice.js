import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [] },
  reducers: {
    addNotification: (state, { payload }) => {
      state.items.unshift({ id: Date.now(), ...payload });
      if (state.items.length > 100) state.items.length = 100;
    },
    removeNotification: (state, { payload }) => {
      state.items = state.items.filter((n) => n.id !== payload);
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
