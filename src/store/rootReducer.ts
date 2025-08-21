import { combineSlices } from "@reduxjs/toolkit"

import cityReducer from './city/slice.ts'
import upkeepSlice from "./upkeep/slice.ts";

export const rootReducer = combineSlices(
    cityReducer,
    upkeepSlice
);