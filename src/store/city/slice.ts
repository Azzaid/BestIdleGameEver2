import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {HexCell} from "../../models/city/HexGrid.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {INITIAL_CITY_CELL_RADIUS, FOOTPRINT_PER_DEMOLISHED_HEX, FOOTPRINT_PER_SURVIVED_SIEGE} from "../../data/constants.ts";
import { DEFAULT_BATTLE_BACKGROUND_ID } from "../../data/battle/backgrounds.ts";
import {coordKey} from "../../pages/City/Components/CityHex/hexUtils.ts";
import type {CityState} from "../../models/store/city.ts";
import {detectMultistructures} from "../../models/city/multistructureDetection.ts";
import {STRUCTURES, STRUCTURES_BY_ID} from "../../data/buildings/index.ts";
import {superstructures, walls} from "../../data/identificators/index.ts";

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
                wallKey: row === -cityRadius ? walls.medieval.scrapBarricade : null,
                wallDevelopmentVector: DEVELOPMENT_VECTORS.medieval,
                wallTopKey: column === 0 && row === -cityRadius ? superstructures.medieval.oldStump : null,
                wallTopDevelopmentVector: DEVELOPMENT_VECTORS.medieval,
            });
        }
    }
    return generatedCells;
})

const getResizedHexes = (existingHexes: HexCell[], cityRadius: number) => {
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
                wallKey: null,
                wallTopKey: null,
            }
            : hex;
    });
}

const getStructurePartHexKeys = (hexes: HexCell[], targetHex: HexCell): string[] => {
    if (targetHex.kind !== "city" || !targetHex.partOfStructureId) return [];

    const coreCellKey = targetHex.structureCoreCellKey ?? targetHex.cellKey;

    return hexes.flatMap(hex => (
        hex.kind === "city" && hex.partOfStructureId && (hex.structureCoreCellKey ?? hex.cellKey) === coreCellKey
            ? [hex.cellKey]
            : []
    ));
};

const getDemolishedHexKeys = (hexes: HexCell[], targetHex: HexCell): string[] => {
    if (targetHex.kind !== "city" || (!targetHex.buildingKey && !targetHex.partOfStructureId)) return [];

    const structurePartKeys = getStructurePartHexKeys(hexes, targetHex);
    if (structurePartKeys.length) return structurePartKeys;

    return [targetHex.cellKey];
};

// Define the initial state using that type
const initialState: CityState = {
    hexes: getInitialHexes(),
    cellRadius: INITIAL_CITY_CELL_RADIUS,
    cityFootprint: 0,
    builtStructureIds: [],
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
            if (currentHex.kind !== "city" || currentHex.buildingKey || currentHex.partOfStructureId) return;

            state.hexes[hexToBuildIndex] = {
                ...action.payload,
                kind: currentHex.kind,
                spriteKey: null,
                partOfStructureId: null,
                structureCoreCellKey: null,
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
        buildMultistructure: (state, action: PayloadAction<{ coreCellKey: string; structureId: string }>) => {
            const { coreCellKey, structureId } = action.payload;
            const structureDef = STRUCTURES_BY_ID[structureId];
            if (!structureDef) return;

            // Find the complete candidate matching the provided core and structure id
            const candidate = detectMultistructures(state.hexes, STRUCTURES)
                .find(result =>
                    result.isComplete &&
                    result.structure.id === structureId &&
                    result.coreHex.cellKey === coreCellKey
                );
            if (!candidate) return;

            const involvedKeys = new Set<string>([
                candidate.coreHex.cellKey,
                ...candidate.matchedSatellites.map(m => m.hex.cellKey),
            ]);

            const partKeys = [...involvedKeys];

            // Replace core and satellites with linked multistructure parts
            state.hexes.forEach(hex => {
                if (hex.kind !== "city") return;
                if (!involvedKeys.has(hex.cellKey)) return;

                hex.buildingKey = structureId;
                hex.developmentVector = DEVELOPMENT_VECTORS[structureDef.vector];
                hex.partOfStructureId = structureId;
                hex.structureCoreCellKey = coreCellKey;
                hex.spriteKey = `${structureId}:${partKeys.indexOf(hex.cellKey)}`;
            });

            if (!state.builtStructureIds.includes(structureId)) {
                state.builtStructureIds.push(structureId);
            }
        },
        retreatCityRadius: (state) => {
            const nextRadius = Math.max(1, state.cellRadius - 1);
            state.cellRadius = nextRadius;
            state.hexes = getResizedHexes(state.hexes, nextRadius);
        },
        expandCityRadius: (state) => {
            const nextRadius = state.cellRadius + 1;
            state.cellRadius = nextRadius;
            state.hexes = getResizedHexes(state.hexes, nextRadius);
        },
        demolishHex: (state, action: PayloadAction<{cellKey: string}>) => {
            const targetHex = state.hexes.find(hex => hex.cellKey === action.payload.cellKey);
            if (!targetHex || targetHex.kind !== "city" || (!targetHex.buildingKey && !targetHex.partOfStructureId)) return;

            const demolishedHexKeys = new Set(getDemolishedHexKeys(state.hexes, targetHex));
            state.cityFootprint += demolishedHexKeys.size * FOOTPRINT_PER_DEMOLISHED_HEX;
            state.hexes.forEach(hex => {
                if (!demolishedHexKeys.has(hex.cellKey)) return;

                hex.buildingKey = null;
                hex.spriteKey = null;
                hex.partOfStructureId = null;
                hex.structureCoreCellKey = null;
            });
        },
        recordSurvivedSiege: (state) => {
            state.cityFootprint += FOOTPRINT_PER_SURVIVED_SIEGE;
        },
    },
})

export const {
    buildHex,
    buildWall,
    buildWallTop,
    buildMultistructure,
    demolishHex,
    retreatCityRadius,
    expandCityRadius,
    recordSurvivedSiege,
} = citySlice.actions

export default citySlice
