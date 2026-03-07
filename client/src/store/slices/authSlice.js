import { createSlice } from "@reduxjs/toolkit";

const loadAuth = () => {
  try {
    const serialized = localStorage.getItem("auth");
    return serialized ? JSON.parse(serialized) : { user: null, accessToken: null, refreshToken: null };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
};

const saveAuth = (state) => {
  try {
    localStorage.setItem("auth", JSON.stringify(state));
  } catch {}
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuth(),
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      saveAuth({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken });
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
