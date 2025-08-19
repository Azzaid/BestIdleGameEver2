import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {HexCell} from "../../models/city/HexGrid.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";

const getInitialHexes = ((cityRadius=6) => {
    const generatedCells: HexCell[] = [];
    for (let column = -cityRadius; column <= cityRadius; column++) {
        const rowMin = Math.max(-cityRadius, -column - cityRadius);
        const rowMax = Math.min(cityRadius, -column + cityRadius);
        for (let row = rowMin; row <= rowMax; row++) {
            generatedCells.push({
                column,
                row,
                buildingKey: null,
                developmentVector: DEVELOPMENT_VECTORS.default,
            });
        }
    }
    return generatedCells;
})

// Define a type for the slice state
interface CityState {
    hexes: HexCell[]
}

// Define the initial state using that type
const initialState: CityState = {
    hexes: getInitialHexes(),
}

export const citySlice = createSlice({
    name: 'city',
    initialState,
    reducers: {
        buildHex: (state, action: PayloadAction<HexCell>) => {
            const hexToBuildIndex = state.hexes.findIndex(hex => hex.column === action.payload.column && hex.row === action.payload.row);
            state.hexes[hexToBuildIndex] = action.payload;
        },
    },
})

export const { buildHex } = citySlice.actions

export default citySlice