import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {AxialCoordinate, HexCell} from "../../models/city/HexGrid.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {INITIAL_CITY_CELL_RADIUS} from "../../data/constants.ts";
import {coordKey} from "../../pages/City/Components/CityHex/hexUtils.ts";

const getInitialHexes = ((cityRadius=INITIAL_CITY_CELL_RADIUS) => {
    const generatedCells: HexCell[] = [];
    for (let column = -cityRadius; column <= cityRadius; column++) {
        const rowMin = Math.max(-cityRadius, -column - cityRadius);
        const rowMax = Math.min(cityRadius, -column + cityRadius);
        for (let row = rowMin; row <= rowMax; row++) {
            generatedCells.push({
                column,
                row,
                cellKey: coordKey({column, row}),
                buildingKey: null,
                developmentVector: DEVELOPMENT_VECTORS.default,
            });
        }
    }
    return generatedCells;
})

// Define a type for the slice state
interface CityState {
    hexes: HexCell[],
    cellRadius: number,
    selectedHex?: AxialCoordinate,
}

// Define the initial state using that type
const initialState: CityState = {
    hexes: getInitialHexes(),
    cellRadius: INITIAL_CITY_CELL_RADIUS
}

export const citySlice = createSlice({
    name: 'city',
    initialState,
    reducers: {
        buildHex: (state, action: PayloadAction<HexCell>) => {
            const hexToBuildIndex = state.hexes.findIndex(hex => hex.column === action.payload.column && hex.row === action.payload.row);
            if (hexToBuildIndex === -1) return;

            state.hexes[hexToBuildIndex] = action.payload;
        },
    },
})

export const { buildHex } = citySlice.actions

export default citySlice
