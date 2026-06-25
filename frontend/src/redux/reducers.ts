import { combineReducers } from "@reduxjs/toolkit";

import sessionSlice from "./slices/session/sessionSlice";

const sessionReducer = combineReducers({
  session: sessionSlice,
});

export const rootReducer = combineReducers({
  session: sessionReducer,
});
