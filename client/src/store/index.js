import { configureStore } from "@reduxjs/toolkit";
import { api } from "./services/api";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import notificationsReducer from "./slices/notificationsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export default store;
