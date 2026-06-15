import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {HexCell} from "../../models/city/HexGrid.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {INITIAL_CITY_CELL_RADIUS, TRACE_PER_DEMOLISHED_HEX, TRACE_PER_SURVIVED_SIEGE} from "../../data/constants.ts";
import { DEFAULT_BATTLE_BACKGROUND_ID } from "../../data/battle/backgrounds.ts";
import {coordKey} from "../../pages/City/Components/CityHex/hexUtils.ts";
import type {CityState} from "../../models/store/city.ts";
import {detectMultistructures} from "../../models/city/multistructureDetection.ts";
import {STRUCTURES} from "../../data/structures/index.ts";

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

const getDemolishedHexKeys = (hexes: HexCell[], targetHex: HexCell): string[] => {
    if (targetHex.kind !== "city" || !targetHex.buildingKey) return [];

    const containingStructure = detectMultistructures(hexes, STRUCTURES)
        .filter(result => result.isComplete)
        .find(result => {
            if (result.coreHex.cellKey === targetHex.cellKey) return true;

            return result.matchedSatellites.some(match => match.hex.cellKey === targetHex.cellKey);
        });

    if (!containingStructure) return [targetHex.cellKey];

    return [
        containingStructure.coreHex.cellKey,
        ...containingStructure.matchedSatellites.map(match => match.hex.cellKey),
    ];
};

// Define the initial state using that type
const initialState: CityState = {
    hexes: getInitialHexes(),
    cellRadius: INITIAL_CITY_CELL_RADIUS,
    scarTrace: 0,
    battlefield: {
        backgroundId: DEFAULT_BATTLE_BACKGROUND_ID,
        detailSeed: 1,
    },
}

export const citySlice = createSlice({
    name: 'city',
    initialState,
    reducers: {
        buildHex: (state, action: PayloadAction<HexCell>) => {
            const hexToBuildIndex = state.hexes.findIndex(hex => hex.column === action.payload.column && hex.row === action.payload.row);
            if (hexToBuildIndex === -1) return;
            const currentHex = state.hexes[hexToBuildIndex];
            const replacesExistingBuilding = currentHex.kind === "city"
                && Boolean(currentHex.buildingKey)
                && currentHex.buildingKey !== action.payload.buildingKey;
            const demolishedHexKeys = replacesExistingBuilding
                ? new Set(getDemolishedHexKeys(state.hexes, currentHex))
                : new Set<string>();

            if (replacesExistingBuilding) {
                state.scarTrace += demolishedHexKeys.size * TRACE_PER_DEMOLISHED_HEX;
                state.hexes.forEach((hex, index) => {
                    if (index === hexToBuildIndex || !demolishedHexKeys.has(hex.cellKey)) return;

                    hex.buildingKey = null;
                });
            }

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
        demolishHex: (state, action: PayloadAction<{cellKey: string}>) => {
            const targetHex = state.hexes.find(hex => hex.cellKey === action.payload.cellKey);
            if (!targetHex || targetHex.kind !== "city" || !targetHex.buildingKey) return;

            const demolishedHexKeys = new Set(getDemolishedHexKeys(state.hexes, targetHex));
            state.scarTrace += demolishedHexKeys.size * TRACE_PER_DEMOLISHED_HEX;
            state.hexes.forEach(hex => {
                if (!demolishedHexKeys.has(hex.cellKey)) return;

                hex.buildingKey = null;
            });
        },
        recordSurvivedSiege: (state) => {
            state.scarTrace += TRACE_PER_SURVIVED_SIEGE;
        },
    },
})

export const {
    buildHex,
    buildWall,
    buildWallTop,
    demolishHex,
    retreatCityRadius,
    recordSurvivedSiege,
} = citySlice.actions

export default citySlice
