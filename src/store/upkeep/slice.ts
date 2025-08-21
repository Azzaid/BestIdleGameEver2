import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
interface upkeepState {
    resilience: number,
}

// Define the initial state using that type
const initialState: upkeepState = {
    resilience: 0,
}

export const upkeepSlice = createSlice({
    name: 'upkeep',
    initialState,
    reducers: {
        setResilience: (state, action: PayloadAction<number>) => {
            state.resilience = action.payload;
        },
    },
})

export const { setResilience } = upkeepSlice.actions

export default upkeepSlice