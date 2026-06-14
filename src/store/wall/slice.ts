import {createSlice} from "@reduxjs/toolkit";
import {ALL_WALL_BUILDINGS} from "../../data/wall/index.ts";
import type {WallState} from "../../models/store/wall.ts";

const initialState: WallState = {
    unlockedWallBuildingIds: Object.keys(ALL_WALL_BUILDINGS),
};

export const wallSlice = createSlice({
    name: "wall",
    initialState,
    reducers: {},
});

export default wallSlice;
