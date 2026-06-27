import { configureStore } from '@reduxjs/toolkit'
import {rootReducer} from "./rootReducer.ts";
import {loadPersistedState, savePersistedState} from "./persistence.ts";

export const store = configureStore({
    reducer: rootReducer,
    preloadedState: loadPersistedState(),
})

store.subscribe(() => {
    savePersistedState(store.getState());
})
