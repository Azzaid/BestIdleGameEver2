import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {HexCell} from "../../models/city/HexGrid.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import {
    DEFAULT_INITIAL_CITY_BIOME,
    INITIAL_CITY_CELL_RADIUS,
    FOOTPRINT_PER_DEMOLISHED_HEX,
    FOOTPRINT_PER_SURVIVED_SIEGE,
    maxCitySize,
} from "../../data/constants.ts";
import { DEFAULT_BATTLE_BACKGROUND_ID } from "../../models/battle/backgrounds.ts";
import type {CityState} from "../../models/store/city.ts";
import {detectMultistructures} from "../../models/city/multistructureDetection.ts";
import {STRUCTURES, STRUCTURES_BY_ID} from "../../data/buildings/index.ts";
import {superstructures, walls} from "../../data/ids.ts";
import {CITY_HEX_BACKGROUND_SPRITE_POOL} from "../../data/cityHexBackgrounds.ts";
import {
    CITY_HEX_BACKGROUND_TYPES,
    type CityBiome,
    selectCityHexBackgroundSprite,
    selectRandomCityBiome,
} from "../../models/city/hexBackgrounds.ts";
import {
    createCityTerrainVectorMap,
    getTerrainVectorMapKey,
    type CityTerrainVectorMap,
} from "../../models/city/terrainVectors.ts";
import {
    getAxialCoordinateKey,
    getAxialDistance,
    getCityExpansionOptions,
    getExpandedCityFrontiers,
    getInitialCityFrontiers,
    type CityExpansionSideId,
} from "../../models/city/expansion.ts";

const UNCLAIMED_REVEAL_RING_COUNT = 2;

const getTerrainBackground = (biome: CityBiome, isUnclaimed: boolean, vector: DevelopmentVectorValue) => selectCityHexBackgroundSprite(
    CITY_HEX_BACKGROUND_SPRITE_POOL,
    isUnclaimed ? CITY_HEX_BACKGROUND_TYPES.claimableTerrain : CITY_HEX_BACKGROUND_TYPES.claimedTerrain,
    biome,
    vector,
    Math.random,
    DEFAULT_INITIAL_CITY_BIOME,
);

const getBuildingUnderlayBackground = (biome: CityBiome, vector: DevelopmentVectorValue = DEVELOPMENT_VECTORS.medieval) => selectCityHexBackgroundSprite(
    CITY_HEX_BACKGROUND_SPRITE_POOL,
    CITY_HEX_BACKGROUND_TYPES.buildingUnderlay,
    biome,
    vector,
    Math.random,
    DEFAULT_INITIAL_CITY_BIOME,
);

const getInitialHexes = ((
    cityRadius=INITIAL_CITY_CELL_RADIUS,
    biome: CityBiome = selectRandomCityBiome(),
    terrainVectorMap: CityTerrainVectorMap = createCityTerrainVectorMap(cityRadius + UNCLAIMED_REVEAL_RING_COUNT),
) => {
    const generatedCells: HexCell[] = [];
    const mapRadius = cityRadius + UNCLAIMED_REVEAL_RING_COUNT;

    for (let column = -mapRadius; column <= mapRadius; column++) {
        const rowMin = Math.max(-mapRadius, -column - mapRadius);
        const rowMax = Math.min(mapRadius, -column + mapRadius);
        for (let row = rowMin; row <= rowMax; row++) {
            const isUnclaimed = getAxialDistance({column, row}, {column: 0, row: 0}) > cityRadius;
            const isWall = !isUnclaimed && row === -cityRadius;
            const terrainVector = terrainVectorMap[getTerrainVectorMapKey({column, row})] ?? DEVELOPMENT_VECTORS.medieval;
            const background = getTerrainBackground(biome, isUnclaimed, terrainVector);

            generatedCells.push({
                column,
                row,
                cellKey: getAxialCoordinateKey({column, row}),
                isUnclaimed,
                kind: isWall ? "wall" : "city",
                buildingKey: null,
                developmentVector: DEVELOPMENT_VECTORS.medieval,
                backgroundSpriteId: background.backgroundSpriteId,
                backgroundDevelopmentVector: background.backgroundDevelopmentVector,
                wallKey: isWall ? walls.neutral.scrapBarricade : null,
                wallDevelopmentVector: DEVELOPMENT_VECTORS.neutral,
                wallTopKey: column === 0 && isWall ? superstructures.neutral.oldStump : null,
                wallTopDevelopmentVector: DEVELOPMENT_VECTORS.neutral,
            });
        }
    }
    return generatedCells;
})

const getGeneratedHexes = (
    existingHexes: HexCell[],
    mapRadius: number,
    biome: CityBiome,
    terrainVectorMap: CityTerrainVectorMap,
) => {
    const existingByKey = new Map(existingHexes.map(hex => [hex.cellKey, hex]));
    const generatedCells: HexCell[] = [];

    for (let column = -mapRadius; column <= mapRadius; column++) {
        const rowMin = Math.max(-mapRadius, -column - mapRadius);
        const rowMax = Math.min(mapRadius, -column + mapRadius);

        for (let row = rowMin; row <= rowMax; row++) {
            const cellKey = getAxialCoordinateKey({column, row});
            const existingHex = existingByKey.get(cellKey);

            if (existingHex) {
                generatedCells.push(existingHex);
                continue;
            }

            const terrainVector = terrainVectorMap[getTerrainVectorMapKey({column, row})] ?? DEVELOPMENT_VECTORS.medieval;
            const background = getTerrainBackground(biome, true, terrainVector);

            generatedCells.push({
                column,
                row,
                cellKey,
                isUnclaimed: true,
                kind: "city",
                buildingKey: null,
                developmentVector: DEVELOPMENT_VECTORS.medieval,
                backgroundSpriteId: background.backgroundSpriteId,
                backgroundDevelopmentVector: background.backgroundDevelopmentVector,
                wallKey: null,
                wallDevelopmentVector: undefined,
                wallTopKey: null,
                wallTopDevelopmentVector: undefined,
            });
        }
    }

    return generatedCells;
};

const getResizedHexes = (
    existingHexes: HexCell[],
    cityRadius: number,
    biome: CityBiome,
    terrainVectorMap: CityTerrainVectorMap,
) => {
    const existingByKey = new Map(existingHexes.map(hex => [hex.cellKey, hex]));

    return getInitialHexes(cityRadius, biome, terrainVectorMap).map(hex => {
        const existingHex = existingByKey.get(hex.cellKey);
        if (!existingHex || hex.isUnclaimed || existingHex.isUnclaimed || hex.kind === "wall") {
            return hex;
        }

        return {
            ...existingHex,
            isUnclaimed: false,
            kind: "city" as const,
            wallKey: null,
            wallTopKey: null,
        };
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

const getInitialState = (biome: CityBiome): CityState => {
    const terrainVectorMap = createCityTerrainVectorMap(maxCitySize + UNCLAIMED_REVEAL_RING_COUNT);
    const frontiers = getInitialCityFrontiers(INITIAL_CITY_CELL_RADIUS);

    return {
        hexes: getGeneratedHexes(
            getInitialHexes(INITIAL_CITY_CELL_RADIUS, biome, terrainVectorMap),
            maxCitySize + UNCLAIMED_REVEAL_RING_COUNT,
            biome,
            terrainVectorMap,
        ),
        cellRadius: INITIAL_CITY_CELL_RADIUS,
        maxCellRadius: maxCitySize,
        frontiers,
        terrainVectorMap,
        cityFootprint: 0,
        builtStructureIds: [],
        biome,
        battlefield: {
            backgroundId: DEFAULT_BATTLE_BACKGROUND_ID,
            detailSeed: 1,
        },
    };
};

// Define the initial state using that type
const initialState: CityState = getInitialState(DEFAULT_INITIAL_CITY_BIOME);

export const citySlice = createSlice({
    name: 'city',
    initialState,
    reducers: {
        buildHex: (state, action: PayloadAction<HexCell>) => {
            const hexToBuildIndex = state.hexes.findIndex(hex => hex.column === action.payload.column && hex.row === action.payload.row);
            if (hexToBuildIndex === -1) return;
            const currentHex = state.hexes[hexToBuildIndex];
            if (currentHex.isUnclaimed || currentHex.kind !== "city" || currentHex.buildingKey || currentHex.partOfStructureId) return;

            const background = action.payload.developmentVector === DEVELOPMENT_VECTORS.neutral
                ? {
                    backgroundSpriteId: currentHex.backgroundSpriteId,
                    backgroundDevelopmentVector: currentHex.backgroundDevelopmentVector,
                }
                : getBuildingUnderlayBackground(state.biome, action.payload.developmentVector);

            state.hexes[hexToBuildIndex] = {
                ...action.payload,
                kind: currentHex.kind,
                ...background,
                spriteKey: null,
                initialBuildingKey: null,
                partOfStructureId: null,
                structureCoreCellKey: null,
            };
        },
        buildWall: (state, action: PayloadAction<{cellKey: string; wallKey: string; developmentVector: DevelopmentVectorValue}>) => {
            const hex = state.hexes.find(cell => cell.cellKey === action.payload.cellKey);
            if (!hex || hex.isUnclaimed || hex.kind !== "wall" || hex.wallKey === action.payload.wallKey) return;

            if (hex.wallKey) {
                state.cityFootprint += FOOTPRINT_PER_DEMOLISHED_HEX;
            }
            hex.wallKey = action.payload.wallKey;
            hex.wallDevelopmentVector = action.payload.developmentVector;
        },
        buildWallTop: (state, action: PayloadAction<{cellKey: string; wallTopKey: string; developmentVector: DevelopmentVectorValue}>) => {
            const hex = state.hexes.find(cell => cell.cellKey === action.payload.cellKey);
            if (!hex || hex.isUnclaimed || hex.kind !== "wall" || hex.wallTopKey) return;

            hex.wallTopKey = action.payload.wallTopKey;
            hex.wallTopDevelopmentVector = action.payload.developmentVector;
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

            // Replace core and satellites with linked multistructure parts
            state.hexes.forEach(hex => {
                if (hex.isUnclaimed || hex.kind !== "city") return;
                if (!involvedKeys.has(hex.cellKey)) return;

                const initialBuildingKey = hex.initialBuildingKey ?? hex.buildingKey;
                hex.buildingKey = structureId;
                hex.developmentVector = DEVELOPMENT_VECTORS[structureDef.vector];
                if (hex.developmentVector !== DEVELOPMENT_VECTORS.neutral) {
                    Object.assign(hex, getBuildingUnderlayBackground(state.biome, hex.developmentVector));
                }
                hex.initialBuildingKey = initialBuildingKey;
                hex.partOfStructureId = structureId;
                hex.structureCoreCellKey = coreCellKey;
                hex.spriteKey = null;
            });

            if (!state.builtStructureIds.includes(structureId)) {
                state.builtStructureIds.push(structureId);
            }
        },
        retreatCityRadius: (state) => {
            const nextRadius = Math.max(1, state.cellRadius - 1);
            state.cellRadius = nextRadius;
            state.frontiers = getInitialCityFrontiers(nextRadius);
            state.hexes = getResizedHexes(state.hexes, nextRadius, state.biome, state.terrainVectorMap);
        },
        expandCityRadius: (state) => {
            const nextRadius = Math.min(state.maxCellRadius, state.cellRadius + 1);
            if (nextRadius === state.cellRadius) return;

            state.cellRadius = nextRadius;
            state.frontiers = getInitialCityFrontiers(nextRadius);
            state.hexes = getResizedHexes(state.hexes, nextRadius, state.biome, state.terrainVectorMap);
        },
        expandCitySide: (state, action: PayloadAction<{sideId: CityExpansionSideId}>) => {
            const option = getCityExpansionOptions(state.hexes, state.maxCellRadius, state.frontiers)
                .find(option => option.side.id === action.payload.sideId);
            if (!option || option.addedHexCount === 0) return;

            const nextFrontiers = getExpandedCityFrontiers(state.frontiers, action.payload.sideId);
            const expandedHexKeys = new Set(option.hexes.map(hex => hex.cellKey));
            state.hexes.forEach(hex => {
                if (!expandedHexKeys.has(hex.cellKey) || !hex.isUnclaimed) return;

                const terrainVector = state.terrainVectorMap[hex.cellKey] ?? DEVELOPMENT_VECTORS.medieval;
                Object.assign(hex, getTerrainBackground(state.biome, false, terrainVector));
                hex.isUnclaimed = false;
                hex.kind = "city";
                hex.wallKey = null;
                hex.wallDevelopmentVector = undefined;
                hex.wallTopKey = null;
                hex.wallTopDevelopmentVector = undefined;
            });
            state.frontiers = nextFrontiers;

            const claimedHexes = state.hexes.filter(hex => !hex.isUnclaimed);
            state.cellRadius = claimedHexes.reduce((radius, hex) => (
                Math.max(radius, getAxialDistance(hex, {column: 0, row: 0}))
            ), state.cellRadius);
            const topRow = Math.min(...claimedHexes.map(hex => hex.row));

            state.hexes.forEach(hex => {
                if (hex.isUnclaimed) return;

                if (hex.row === topRow) {
                    hex.kind = "wall";
                    hex.buildingKey = null;
                    hex.spriteKey = null;
                    hex.initialBuildingKey = null;
                    hex.partOfStructureId = null;
                    hex.structureCoreCellKey = null;
                    hex.wallKey = hex.wallKey ?? walls.neutral.scrapBarricade;
                    hex.wallDevelopmentVector = hex.wallDevelopmentVector ?? DEVELOPMENT_VECTORS.neutral;
                    hex.wallTopKey = hex.column === 0 ? hex.wallTopKey ?? superstructures.neutral.oldStump : hex.wallTopKey ?? null;
                    hex.wallTopDevelopmentVector = hex.wallTopKey ? hex.wallTopDevelopmentVector ?? DEVELOPMENT_VECTORS.neutral : undefined;
                    return;
                }

                if (hex.kind === "wall") {
                    hex.kind = "city";
                    hex.wallKey = null;
                    hex.wallDevelopmentVector = undefined;
                    hex.wallTopKey = null;
                    hex.wallTopDevelopmentVector = undefined;
                }
            });
        },
        demolishHex: (state, action: PayloadAction<{cellKey: string}>) => {
            const targetHex = state.hexes.find(hex => hex.cellKey === action.payload.cellKey);
            if (!targetHex || targetHex.isUnclaimed || targetHex.kind !== "city" || (!targetHex.buildingKey && !targetHex.partOfStructureId)) return;

            const demolishedHexKeys = new Set(getDemolishedHexKeys(state.hexes, targetHex));
            state.cityFootprint += demolishedHexKeys.size * FOOTPRINT_PER_DEMOLISHED_HEX;
            state.hexes.forEach(hex => {
                if (!demolishedHexKeys.has(hex.cellKey)) return;

                hex.buildingKey = null;
                Object.assign(
                    hex,
                    getTerrainBackground(
                        state.biome,
                        false,
                        state.terrainVectorMap[hex.cellKey] ?? DEVELOPMENT_VECTORS.medieval,
                    ),
                );
                hex.spriteKey = null;
                hex.initialBuildingKey = null;
                hex.partOfStructureId = null;
                hex.structureCoreCellKey = null;
            });
        },
        demolishWallTop: (state, action: PayloadAction<{cellKey: string}>) => {
            const targetHex = state.hexes.find(hex => hex.cellKey === action.payload.cellKey);
            if (!targetHex || targetHex.isUnclaimed || targetHex.kind !== "wall" || !targetHex.wallTopKey) return;

            targetHex.wallTopKey = null;
            targetHex.wallTopDevelopmentVector = undefined;
        },
        recordSurvivedSiege: (state) => {
            state.cityFootprint += FOOTPRINT_PER_SURVIVED_SIEGE;
        },
        resetCityForMigration: () => getInitialState(selectRandomCityBiome()),
    },
})

export const {
    buildHex,
    buildWall,
    buildWallTop,
    buildMultistructure,
    demolishHex,
    demolishWallTop,
    retreatCityRadius,
    expandCityRadius,
    expandCitySide,
    recordSurvivedSiege,
    resetCityForMigration,
} = citySlice.actions

export default citySlice
