import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {HexCell} from "../../models/city/HexGrid.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {INITIAL_CITY_CELL_RADIUS} from "../../data/constants.ts";
import {coordKey} from "../../pages/City/Components/CityHex/hexUtils.ts";
import type {CityState} from "../../models/store/city.ts";

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
                kind: row === -cityRadius ? "wall" : "city",
                buildingKey: null,
                developmentVector: DEVELOPMENT_VECTORS.medieval,
                wallKey: row === -cityRadius ? "timberBulwark" : null,
                wallDevelopmentVector: DEVELOPMENT_VECTORS.medieval,
                wallTopKey: null,
                wallTopDevelopmentVector: DEVELOPMENT_VECTORS.medieval,
            });
        }
    }
    return generatedCells;
})

const getRetreatedHexes = (existingHexes: HexCell[], cityRadius: number) => {
    const existingByKey = new Map(existingHexes.map(hex => [hex.cellKey, hex]));

    return getInitialHexes(cityRadius).map(hex => {
        const existingHex = existingByKey.get(hex.cellKey);
        if (hex.kind === "wall") {
            return hex;
        }

        return existingHex
            ? {
                ...existingHex,
                kind: "city" as const,
            }
            : hex;
    });
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

            state.hexes[hexToBuildIndex] = {
                ...action.payload,
                kind: state.hexes[hexToBuildIndex].kind,
            };
        },
        buildWall: (state, action: PayloadAction<{cellKey: string; wallKey: string}>) => {
            const hex = state.hexes.find(cell => cell.cellKey === action.payload.cellKey);
            if (!hex || hex.kind !== "wall") return;

            hex.wallKey = action.payload.wallKey;
            hex.wallDevelopmentVector = DEVELOPMENT_VECTORS.medieval;
        },
        buildWallTop: (state, action: PayloadAction<{cellKey: string; wallTopKey: string}>) => {
            const hex = state.hexes.find(cell => cell.cellKey === action.payload.cellKey);
            if (!hex || hex.kind !== "wall") return;

            hex.wallTopKey = action.payload.wallTopKey;
            hex.wallTopDevelopmentVector = DEVELOPMENT_VECTORS.medieval;
        },
        retreatCityRadius: (state) => {
            const nextRadius = Math.max(1, state.cellRadius - 1);
            state.cellRadius = nextRadius;
            state.hexes = getRetreatedHexes(state.hexes, nextRadius);
        },
    },
})

export const { buildHex, buildWall, buildWallTop, retreatCityRadius } = citySlice.actions

export default citySlice
