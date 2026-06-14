import {createSlice} from "@reduxjs/toolkit";
import {ALL_WALL_BUILDINGS} from "../../data/wall.ts";

interface WallState {
    unlockedWallBuildingIds: string[];
}

const initialState: WallState = {
    unlockedWallBuildingIds: Object.keys(ALL_WALL_BUILDINGS),
};

export const wallSlice = createSlice({
    name: "wall",
    initialState,
    reducers: {},
});

export default wallSlice;
