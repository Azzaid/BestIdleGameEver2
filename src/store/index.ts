import { configureStore } from '@reduxjs/toolkit'
import {rootReducer} from "./rootReducer.ts";
import {loadPersistedState, savePersistedState} from "./persistence.ts";
import { savePersistedDebugMode } from "./debug/persistence.ts";

export const store = configureStore({
    reducer: rootReducer,
    preloadedState: loadPersistedState(),
})

let previousDebugMode = store.getState().debug.enabled;

store.subscribe(() => {
    const state = store.getState();

    savePersistedState(state);

    if (state.debug.enabled !== previousDebugMode) {
        previousDebugMode = state.debug.enabled;
        savePersistedDebugMode(state.debug.enabled);
    }
})
