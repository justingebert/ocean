import { describe, test, expect } from "vitest";
import { sessionSlice } from "./sessionSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { CredentialProperties } from "../../../types/models";

const initialState = {
  isLoggedIn: undefined,
  loading: false,
};

describe("sessionSlice reducer", () => {
  test("should return the initial state", () => {
    expect(sessionSlice.reducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  test("should handle loginStart action", () => {
    const mockCredentials: CredentialProperties = {
      username: "testuser",
      password: "password123",
    };

    const action: PayloadAction<CredentialProperties> = {
      type: sessionSlice.actions.loginStart.type,
      payload: mockCredentials,
    };

    const state = sessionSlice.reducer(initialState, action);

    expect(state.loading).toBe(true);
  });

  test("should handle loginSuccess action", () => {
    const action = { type: sessionSlice.actions.loginSuccess.type };
    const state = sessionSlice.reducer({ ...initialState, loading: true }, action);

    expect(state.isLoggedIn).toBe(true);

    expect(state.error).toBeUndefined();

    expect(state.loading).toBe(false);
  });

  test("should handle loginFailed action", () => {
    const errorMessage = "Login failed";
    const action: PayloadAction<string> = {
      type: sessionSlice.actions.loginFailed.type,
      payload: errorMessage,
    };
    const state = sessionSlice.reducer(initialState, action);

    expect(state.error).toBe(errorMessage);

    expect(state.loading).toBe(false);
  });

  test("should handle restoreSession action", () => {
    const action = { type: sessionSlice.actions.restoreSession.type };
    const state = sessionSlice.reducer({ ...initialState, isLoggedIn: true }, action);

    expect(state.isLoggedIn).toBeUndefined();
  });

  test("should handle logout action", () => {
    const action = { type: sessionSlice.actions.logout.type };
    const state = sessionSlice.reducer({ ...initialState, isLoggedIn: true }, action);

    expect(state.isLoggedIn).toBe(false);

    expect(state.error).toBeUndefined();

    expect(state.loading).toBe(false);
  });
});
