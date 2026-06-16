import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type {ResearchState} from "../../models/store/research.ts";
import {technologies} from "../../data/identificators/index.ts";

const initialState: ResearchState = {
    purchasedTechsIds: [technologies.medieval.root],
}

export const researchSlice = createSlice({
    name: 'research',
    initialState,
    reducers: {
        purchaseTech: (state, action: PayloadAction<string>) => {
            if (!state.purchasedTechsIds.includes(action.payload)) {
                state.purchasedTechsIds.push(action.payload);
            }
        },
    },
})

export const {purchaseTech} = researchSlice.actions

export default researchSlice
