import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from './redux/store';
import RootView from './views';
import { restoreSession } from './redux/slices/session/sessionSlice';
import {setupRequestInterceptors} from "./api/client";

/**
 * Initializes a QueryClient instance for handling API requests with `react-query`.
 */
const queryClient = new QueryClient();
/**
 * The main application component.
 * - Provides Redux and React Query contexts.
 * - Restores session and sets up Axios interceptors on mount.
 */
const App: React.FC = () => {
    /**
     * Dispatches `restoreSession()` when the app mounts.
     * This restores the user's authentication session from local storage.
     */
    useEffect(() => {
        store.dispatch(restoreSession());
    }, []);
    /**
     * Dispatches `restoreSession()` again (potential redundancy?).
     * Also sets up Axios interceptors for request handling.
     */
    useEffect(() => {
        store.dispatch(restoreSession());

        // Attach Axios interceptors when the app starts
        setupRequestInterceptors(store.dispatch);
        console.log("Axios interceptor initialized!");
    }, []);

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <RootView />
            </QueryClientProvider>
        </Provider>
    );
};

export default App;
