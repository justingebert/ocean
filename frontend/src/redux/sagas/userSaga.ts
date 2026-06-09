import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";

import {
  loginFailed,
  loginStart,
  loginSuccess,
  logout,
  restoreSession,
} from "../slices/session/sessionSlice";
import { CredentialProperties } from "../../types/models";
import { SessionApi, TokensReturn } from "../../api/sessionApi";
import { setBearerToken } from "../../api/client";
import { UserClient } from "../../api/userClient";

/**
 * Handles user login by calling the authentication API.
 * - Fetches access and refresh tokens using credentials.
 * - Stores tokens in `localStorage` and sets them for API requests.
 * - Dispatches `loginSuccess` on success or `loginFailed` on error.
 *
 * @param payload - The user credentials (email, password, etc.).
 */
export function* loginAsync({ payload }: PayloadAction<CredentialProperties>) {
  // Get tokens for crendentials
  let response: TokensReturn;
  try {
    response = yield call(SessionApi.login, payload);
  } catch (error) {
    yield put(loginFailed((error as Error).message));
    return;
  }
  const { accessToken, refreshToken } = response;

  // Distribute accessToken and refreshToken to localStorage and axios
  setBearerToken(accessToken);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  yield put(loginSuccess());
}
/**
 * Restores an existing user session by checking stored tokens.
 * - If an `accessToken` exists, sets it and verifies authentication.
 * - If verification fails, logs the user out.
 */
export function* restoreSessionAsync() {
  // Restore access Token
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken === null) {
    yield put(logout());
    return;
  }

  // Initiate axios interceptor
  setBearerToken(accessToken);
  try {
    yield call(UserClient.getUser);
    yield put(loginSuccess());
  } catch {
    yield put(logout());
  }
}
/**
 * Handles user logout by clearing authentication tokens.
 * - Removes tokens from `localStorage`.
 * - Resets API authorization header.
 * - Dispatches logout action.
 */
export function* logoutAsync() {
  yield call(setBearerToken, "");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
/**
 * Authentication saga that listens for login, logout, and session restoration actions.
 */
export default function* authSaga() {
  yield takeLatest(loginStart.type, loginAsync);
  yield takeLatest(restoreSession.type, restoreSessionAsync);
  yield takeLatest(logout.type, logoutAsync);
}
