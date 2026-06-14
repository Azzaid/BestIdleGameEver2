import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {UpkeepState} from "../../models/store/upkeep.ts";

// Define the initial state using that type
const initialState: UpkeepState = {
    resilience: 0,
}

export const upkeepSlice = createSlice({
    name: 'upkeep',
    initialState,
    reducers: {
        setResilience: (state, action: PayloadAction<number>) => {
            state.resilience = action.payload;
        },
        recordWaveThreatReached: (state, action: PayloadAction<number>) => {
            state.resilience = Math.max(state.resilience, action.payload);
        },
    },
})

export const { recordWaveThreatReached, setResilience } = upkeepSlice.actions

export default upkeepSlice
