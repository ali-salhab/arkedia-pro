import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalError: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showGlobalError: (state, action) => {
      state.globalError = {
        message: action.payload?.message || "Request failed",
        status: action.payload?.status || null,
      };
    },
    hideGlobalError: (state) => {
      state.globalError = null;
    },
  },
});

export const { showGlobalError, hideGlobalError } = uiSlice.actions;
export default uiSlice.reducer;
