import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {WorldViewMode, WorldViewState} from "../../models/store/worldView.ts";

const initialState: WorldViewState = {
    mode: "city",
};

const worldViewSlice = createSlice({
    name: "worldView",
    initialState,
    reducers: {
        setWorldViewMode: (state, action: PayloadAction<WorldViewMode>) => {
            state.mode = action.payload;
        },
    },
});

export const {setWorldViewMode} = worldViewSlice.actions;

export default worldViewSlice;
