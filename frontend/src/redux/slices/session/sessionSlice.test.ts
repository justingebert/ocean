import { describe, test, expect } from "vitest";
import { sessionSlice } from "./sessionSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { CredentialProperties } from "../../../types/models";

// Define the initial state for sessionSlice before any actions are dispatched
const initialState = {
    isLoggedIn: undefined,
    loading: false,
};
// Tests for sessionSlice reducer to ensure proper state management for authentication
describe("sessionSlice reducer", () => {
    // Ensure that the reducer returns the initial state when given an unknown action
    test("should return the initial state", () => {
        expect(sessionSlice.reducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
    // Ensure loginStart action sets loading to true while initiating authentication
    test("should handle loginStart action", () => {
        // Mock credentials payload for loginStart action
        const mockCredentials: CredentialProperties = {
            username: "testuser",
            password: "password123",
        };

        const action: PayloadAction<CredentialProperties> = {
            type: sessionSlice.actions.loginStart.type,
            payload: mockCredentials,
        };

        const state = sessionSlice.reducer(initialState, action);
        // Verify that the state correctly reflects loading as true after loginStart
        expect(state.loading).toBe(true);
    });
    // Ensure loginSuccess action updates state to reflect a successful login
    test("should handle loginSuccess action", () => {
        const action = { type: sessionSlice.actions.loginSuccess.type };
        const state = sessionSlice.reducer({ ...initialState, loading: true }, action);
        // Confirm that isLoggedIn is set to true on successful login
        expect(state.isLoggedIn).toBe(true);
        // Ensure error is cleared on successful login
        expect(state.error).toBeUndefined();
        // Verify that loading is reset to false after login completion
        expect(state.loading).toBe(false);
    });
    // Ensure loginFailed action correctly handles authentication failure
    test("should handle loginFailed action", () => {
        // Mock error message for failed login attempt
        const errorMessage = "Login failed";
        const action: PayloadAction<string> = {
            type: sessionSlice.actions.loginFailed.type,
            payload: errorMessage,
        };
        const state = sessionSlice.reducer(initialState, action);
        // Confirm that the error message is stored in state
        expect(state.error).toBe(errorMessage);
        // Verify that loading is reset to false after login failure
        expect(state.loading).toBe(false);
    });
    // Ensure restoreSession action resets isLoggedIn state
    test("should handle restoreSession action", () => {
        const action = { type: sessionSlice.actions.restoreSession.type };
        const state = sessionSlice.reducer({ ...initialState, isLoggedIn: true }, action);
        // Verify that session restoration clears isLoggedIn state
        expect(state.isLoggedIn).toBeUndefined();
    });
    // Ensure logout action correctly resets authentication state
    test("should handle logout action", () => {
        const action = { type: sessionSlice.actions.logout.type };
        const state = sessionSlice.reducer({ ...initialState, isLoggedIn: true }, action);
        // Confirm that isLoggedIn is set to false after logout
        expect(state.isLoggedIn).toBe(false);
        // Ensure any existing errors are cleared after logout
        expect(state.error).toBeUndefined();
        // Verify that loading is reset to false after logout
        expect(state.loading).toBe(false);
    });
});
