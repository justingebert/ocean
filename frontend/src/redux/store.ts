import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { rootReducer } from "./reducers";
import rootSaga from "./sagas/sagas";

/** Creates the Redux Saga middleware instance. */
const sagaMiddleware = createSagaMiddleware();
/**
 * Configures the Redux store with reducers and middleware.
 * - Integrates Redux-Saga for handling side effects.
 * - Disables serializable check to accommodate non-serializable values in middleware.
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
});
/** Runs the root Saga to handle side effects. */
sagaMiddleware.run(rootSaga);
/** Represents the root state structure of the Redux store. */
export type RootState = ReturnType<typeof store.getState>;
/** Defines the type for dispatching actions within the Redux store. */
export type AppDispatch = typeof store.dispatch;
