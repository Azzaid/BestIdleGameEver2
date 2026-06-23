import {createSlice} from "@reduxjs/toolkit";

const initialState = {};

export const wallSlice = createSlice({
    name: "wall",
    initialState,
    reducers: {
        resetWallForMigration: () => initialState,
    },
});

export const {resetWallForMigration} = wallSlice.actions;

export default wallSlice;
