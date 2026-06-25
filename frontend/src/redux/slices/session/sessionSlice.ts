import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CredentialProperties } from "../../../types/models";

export interface UserState {
  isLoggedIn: boolean | undefined;

  loading: boolean;

  error?: string;
}

const initialState: UserState = {
  isLoggedIn: undefined,
  loading: false,
};

export const sessionSlice = createSlice({
  name: "sessionSlice",
  initialState,
  reducers: {
    loginStart: (state, _action: PayloadAction<CredentialProperties>) => {
      state.loading = true;
      state.error = undefined;
      state.isLoggedIn = undefined;
    },

    loginSuccess: (state) => {
      state.isLoggedIn = true;
      state.error = undefined;
      state.loading = false;
    },

    loginFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    restoreSession: (state) => {
      state.isLoggedIn = undefined;
    },

    logout: (state) => {
      state.isLoggedIn = false;
      state.error = undefined;
      state.loading = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailed, restoreSession, logout } =
  sessionSlice.actions;

export default sessionSlice.reducer;
