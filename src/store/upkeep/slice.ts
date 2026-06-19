import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {UpkeepState} from "../../models/store/upkeep.ts";

// Define the initial state using that type
const initialState: UpkeepState = {
    controlledTerritory: 0,
}

export const upkeepSlice = createSlice({
    name: 'upkeep',
    initialState,
    reducers: {
        setControlledTerritory: (state, action: PayloadAction<number>) => {
            state.controlledTerritory = action.payload;
        },
        recordControlledTerritoryReached: (state, action: PayloadAction<number>) => {
            state.controlledTerritory = Math.max(state.controlledTerritory, action.payload);
        },
    },
})

export const { recordControlledTerritoryReached, setControlledTerritory } = upkeepSlice.actions

export default upkeepSlice
