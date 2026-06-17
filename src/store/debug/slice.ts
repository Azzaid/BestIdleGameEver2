import { createSlice } from "@reduxjs/toolkit";

const debugSlice = createSlice({
    name: "debug",
    initialState: {
        enabled: false,
    },
    reducers: {
        toggleDebugMode: (state) => {
            state.enabled = !state.enabled;
        },
    },
});

export const { toggleDebugMode } = debugSlice.actions;

export default debugSlice;
