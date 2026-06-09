import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CredentialProperties } from "../../../types/models";

/**
 * Defines the shape of the user authentication state.
 */
export interface UserState {
  /** Indicates whether the user is logged in (`true`), logged out (`false`), or session status is unknown (`undefined`). */
  isLoggedIn: boolean | undefined;
  /** Indicates if an authentication request is currently loading. */
  loading: boolean;
  /** Stores an error message if authentication fails. */
  error?: string;
}
/** Initial state for the authentication session. */
const initialState: UserState = {
  isLoggedIn: undefined,
  loading: false,
};
/**
 * Redux slice managing authentication session state.
 */
export const sessionSlice = createSlice({
  name: "sessionSlice",
  initialState,
  reducers: {
    /**
     * Initiates the login process.
     * - Sets `loading` to `true`.
     * - Resets `error` and `isLoggedIn` state.
     *
     * @param state - The current session state.
     * @param _action - The payload containing user credentials (not used directly here).
     */
    loginStart: (state, _action: PayloadAction<CredentialProperties>) => {
      state.loading = true;
      state.error = undefined;
      state.isLoggedIn = undefined;
    },
    /**
     * Handles successful login.
     * - Sets `isLoggedIn` to `true` and clears any errors.
     * - Marks loading as `false`.
     *
     * @param state - The current session state.
     */
    loginSuccess: (state) => {
      state.isLoggedIn = true;
      state.error = undefined;
      state.loading = false;
    },
    /**
     * Handles login failure.
     * - Stores the error message.
     * - Marks loading as `false`.
     *
     * @param state - The current session state.
     * @param action - Payload containing the error message.
     */
    loginFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    /**
     * Restores session state when reloading the application.
     * - Resets `isLoggedIn` to `undefined` until authentication is verified.
     *
     * @param state - The current session state.
     */
    restoreSession: (state) => {
      state.isLoggedIn = undefined;
    },
    /**
     * Logs the user out and resets session state.
     * - Sets `isLoggedIn` to `false`, resets `error`, and marks `loading` as `false`.
     *
     * @param state - The current session state.
     */
    logout: (state) => {
      state.isLoggedIn = false;
      state.error = undefined;
      state.loading = false;
    },
  },
});
// Exporting actions for use in components and sagas
export const { loginStart, loginSuccess, loginFailed, restoreSession, logout } =
  sessionSlice.actions;
// Exporting reducer to be included in the store
export default sessionSlice.reducer;
