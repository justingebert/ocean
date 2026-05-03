import { combineReducers } from "@reduxjs/toolkit";

import sessionSlice from "./slices/session/sessionSlice";

/**
 * Combines all session-related reducers into a single session state.
 * This can be extended if multiple session-related slices are added in the future.
 */
const sessionReducer = combineReducers({
  session: sessionSlice,
});
/**
 * The root reducer that combines all feature-specific reducers.
 * Add new reducers here as the application state grows.
 */
export const rootReducer = combineReducers({
  session: sessionReducer,
  // HINT: control: controlReducer,
  // HINT: data: dataReducer,
});
