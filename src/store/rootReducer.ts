import { combineSlices } from "@reduxjs/toolkit"

import cityReducer from './city/slice.ts'
import upkeepSlice from "./upkeep/slice.ts";
import researchSlice from "./research/slice.ts";
import towersSlice from "./towers/slice.ts";
import wallSlice from "./wall/slice.ts";

export const rootReducer = combineSlices(
    cityReducer,
    upkeepSlice,
    researchSlice,
    towersSlice,
    wallSlice
);
