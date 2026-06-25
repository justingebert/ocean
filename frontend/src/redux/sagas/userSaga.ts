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

export function* loginAsync({ payload }: PayloadAction<CredentialProperties>) {
  let response: TokensReturn;
  try {
    response = yield call(SessionApi.login, payload);
  } catch (error) {
    yield put(loginFailed((error as Error).message));
    return;
  }
  const { accessToken, refreshToken } = response;

  setBearerToken(accessToken);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  yield put(loginSuccess());
}

export function* restoreSessionAsync() {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken === null) {
    yield put(logout());
    return;
  }

  setBearerToken(accessToken);
  try {
    yield call(UserClient.getUser);
    yield put(loginSuccess());
  } catch {
    yield put(logout());
  }
}

export function* logoutAsync() {
  yield call(setBearerToken, "");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export default function* authSaga() {
  yield takeLatest(loginStart.type, loginAsync);
  yield takeLatest(restoreSession.type, restoreSessionAsync);
  yield takeLatest(logout.type, logoutAsync);
}
