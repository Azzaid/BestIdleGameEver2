import { combineSlices } from "@reduxjs/toolkit"

import cityReducer from './city/slice.ts'

export const rootReducer = combineSlices(
    cityReducer
);