import { createSlice } from "@reduxjs/toolkit";
import { loadPersistedDebugMode } from "./persistence.ts";

const debugSlice = createSlice({
    name: "debug",
    initialState: {
        enabled: loadPersistedDebugMode(),
    },
    reducers: {
        toggleDebugMode: (state) => {
            state.enabled = !state.enabled;
        },
    },
});

export const { toggleDebugMode } = debugSlice.actions;

export default debugSlice;
