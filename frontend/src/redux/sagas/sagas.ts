import { all, fork } from "redux-saga/effects";

import userSaga from "./userSaga";

/**
 * Root saga that combines all individual sagas.
 * Uses `redux-saga` to handle side effects.
 *
 * The `all` effect runs multiple sagas concurrently,
 * and `fork` ensures that each saga runs as a non-blocking process.
 */

export default function* rootSaga() {
  yield all([fork(userSaga)]);
}
