import { combineSlices } from "@reduxjs/toolkit"

import cityReducer from './city/slice.ts'
import upkeepSlice from "./upkeep/slice.ts";
import researchSlice from "./research/slice.ts";
import towersSlice from "./towers/slice.ts";
import wallSlice from "./wall/slice.ts";
import debugSlice from "./debug/slice.ts";
import unlocksSlice from "./unlocks/slice.ts";
import globalEventsSlice from "./globalEvents/slice.ts";
import worldViewSlice from "./worldView/slice.ts";
import notificationsSlice from "./notifications/slice.ts";
import hexBackgroundEditorSlice from "./hexBackgroundEditor/slice.ts";

export const rootReducer = combineSlices(
    cityReducer,
    upkeepSlice,
    researchSlice,
    towersSlice,
    wallSlice,
    debugSlice,
    unlocksSlice,
    globalEventsSlice,
    worldViewSlice,
    notificationsSlice,
    hexBackgroundEditorSlice
);
