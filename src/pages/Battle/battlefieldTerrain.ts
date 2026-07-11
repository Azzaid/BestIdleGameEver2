import {
    CITY_HEX_BACKGROUND_SPRITES_BY_ID,
    CITY_HEX_BACKGROUND_SPRITE_POOL,
} from "../../data/cityHexBackgrounds.ts";
import {
    CITY_HEX_BACKGROUND_TYPES,
    getDevelopmentVectorKey,
    selectCityHexBackgroundSprite,
    type CityBiome,
} from "../../models/city/hexBackgrounds.ts";
import {DEFAULT_INITIAL_CITY_BIOME, CITY_HEX_RADIUS, CITY_HEX_WIDTH} from "../../data/constants.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {BattleWallSegment} from "../../models/battle/wallSegment.ts";
import type {BattlefieldTerrainHex} from "../../models/battle/battlefieldTerrain.ts";
import type {AxialCoordinate} from "../../models/city/HexGrid.ts";
import {
    getTerrainVectorMapKey,
    type CityTerrainVectorMap,
} from "../../models/city/terrainVectors.ts";

const HEX_VERTICAL_SPACING = CITY_HEX_RADIUS * 1.5;
const HORIZONTAL_OVERSCAN_HEXES = 2;
const VERTICAL_OVERSCAN_HEXES = 2;

const HEX_DIRECTIONS: readonly AxialCoordinate[] = [
    {column: 1, row: 0},
    {column: 1, row: -1},
    {column: 0, row: -1},
    {column: -1, row: 0},
    {column: -1, row: 1},
    {column: 0, row: 1},
];

export function createBattlefieldTerrainHexes({
    biome,
    terrainVectorMap,
    wallSegments,
    battlefieldWidth,
    battlefieldHeight,
    wallY,
}: {
    biome: CityBiome;
    terrainVectorMap: CityTerrainVectorMap;
    wallSegments: BattleWallSegment[];
    battlefieldWidth: number;
    battlefieldHeight: number;
    wallY: number;
}): BattlefieldTerrainHex[] {
    const wallRow = getBattleWallRow(wallSegments);
    const minOffset = getBattleWallMinOffset(wallSegments, wallRow);
    const minRow = wallRow - Math.ceil(wallY / HEX_VERTICAL_SPACING) - VERTICAL_OVERSCAN_HEXES;
    const maxRow = wallRow + Math.ceil((battlefieldHeight - wallY) / HEX_VERTICAL_SPACING) + VERTICAL_OVERSCAN_HEXES;
    const terrainHexes: BattlefieldTerrainHex[] = [];

    for (let row = minRow; row <= maxRow; row++) {
        const rowCenterY = wallY + (row - wallRow) * HEX_VERTICAL_SPACING;
        const minColumn = Math.floor(minOffset - row / 2 - HORIZONTAL_OVERSCAN_HEXES);
        const maxColumn = Math.ceil(minOffset + battlefieldWidth / CITY_HEX_WIDTH - row / 2 + HORIZONTAL_OVERSCAN_HEXES);

        for (let column = minColumn; column <= maxColumn; column++) {
            const centerX = (column + row / 2 - minOffset) * CITY_HEX_WIDTH + CITY_HEX_WIDTH / 2;
            if (
                centerX < -CITY_HEX_WIDTH * HORIZONTAL_OVERSCAN_HEXES
                || centerX > battlefieldWidth + CITY_HEX_WIDTH * HORIZONTAL_OVERSCAN_HEXES
                || rowCenterY < -CITY_HEX_RADIUS * VERTICAL_OVERSCAN_HEXES
                || rowCenterY > battlefieldHeight + CITY_HEX_RADIUS * VERTICAL_OVERSCAN_HEXES
            ) {
                continue;
            }

            const coordinate = {column, row};
            const terrainVector = getExpandedTerrainVector(terrainVectorMap, coordinate);
            const background = selectCityHexBackgroundSprite(
                CITY_HEX_BACKGROUND_SPRITE_POOL,
                CITY_HEX_BACKGROUND_TYPES.claimedTerrain,
                biome,
                terrainVector,
                createCoordinateRandom(coordinate),
                DEFAULT_INITIAL_CITY_BIOME,
            );

            terrainHexes.push({
                ...coordinate,
                cellKey: getTerrainVectorMapKey(coordinate),
                centerX,
                centerY: rowCenterY,
                backgroundSpriteId: background.backgroundSpriteId,
                backgroundSpriteSrc: CITY_HEX_BACKGROUND_SPRITES_BY_ID[background.backgroundSpriteId]?.src,
                backgroundDevelopmentVector: background.backgroundDevelopmentVector,
                fallbackFill: getBattlefieldTerrainFallbackFill(biome, terrainVector),
            });
        }
    }

    return terrainHexes;
}

function getBattleWallRow(wallSegments: readonly BattleWallSegment[]) {
    return Math.min(...wallSegments.map(segment => segment.row).filter(Number.isFinite), 0);
}

function getBattleWallMinOffset(wallSegments: readonly BattleWallSegment[], wallRow: number) {
    const offsets = wallSegments.map(segment => segment.column + segment.row / 2);
    const minOffset = Math.min(...offsets);

    return Number.isFinite(minOffset) ? minOffset : wallRow / 2;
}

function getExpandedTerrainVector(
    terrainVectorMap: CityTerrainVectorMap,
    coordinate: AxialCoordinate,
): DevelopmentVectorValue {
    const existingVector = terrainVectorMap[getTerrainVectorMapKey(coordinate)];
    if (existingVector) return existingVector;

    for (let distance = 1; distance <= 8; distance++) {
        const candidates = getAxialRing(coordinate, distance)
            .flatMap(candidate => {
                const vector = terrainVectorMap[getTerrainVectorMapKey(candidate)];
                return vector ? [vector] : [];
            });
        if (!candidates.length) continue;

        return chooseMostCommonVector(candidates, coordinate);
    }

    return DEVELOPMENT_VECTORS.medieval;
}

function getAxialRing(center: AxialCoordinate, radius: number): AxialCoordinate[] {
    const coordinates: AxialCoordinate[] = [];
    let current = {
        column: center.column + HEX_DIRECTIONS[4].column * radius,
        row: center.row + HEX_DIRECTIONS[4].row * radius,
    };

    for (const direction of HEX_DIRECTIONS) {
        for (let step = 0; step < radius; step++) {
            coordinates.push(current);
            current = {
                column: current.column + direction.column,
                row: current.row + direction.row,
            };
        }
    }

    return coordinates;
}

function chooseMostCommonVector(
    vectors: readonly DevelopmentVectorValue[],
    coordinate: AxialCoordinate,
): DevelopmentVectorValue {
    const orderedVectors = [
        DEVELOPMENT_VECTORS.medieval,
        DEVELOPMENT_VECTORS.nature,
        DEVELOPMENT_VECTORS.tech,
        DEVELOPMENT_VECTORS.aether,
    ];

    return orderedVectors
        .map((vector, index) => ({
            vector,
            count: vectors.filter(candidate => candidate === vector).length,
            tieBreak: coordinateNoise({column: coordinate.column + index * 11, row: coordinate.row - index * 17}),
        }))
        .sort((left, right) => right.count - left.count || right.tieBreak - left.tieBreak)[0]?.vector
        ?? DEVELOPMENT_VECTORS.medieval;
}

function createCoordinateRandom(coordinate: AxialCoordinate) {
    let index = 0;

    return () => coordinateNoise({
        column: coordinate.column + index++ * 17,
        row: coordinate.row - index * 31,
    });
}

function coordinateNoise({column, row}: AxialCoordinate): number {
    const value = Math.sin(column * 127.1 + row * 311.7 + 91_337 * 0.013) * 43758.5453123;
    return value - Math.floor(value);
}

function getBattlefieldTerrainFallbackFill(
    biome: CityBiome,
    vector: DevelopmentVectorValue,
): number {
    const biomeHue: Record<CityBiome, number> = {
        alpine: 132,
        floodplain: 92,
        swamp: 112,
        steppe: 62,
        rocky: 34,
        volcanic: 8,
        coastal: 188,
        tundra: 200,
        ancientForest: 124,
    };
    const vectorKey = getDevelopmentVectorKey(vector);
    const vectorHueOffset: Record<string, number> = {
        medieval: 0,
        nature: 24,
        tech: 172,
        aether: 222,
    };
    const hue = (biomeHue[biome] + (vectorHueOffset[vectorKey] ?? 0) + 360) % 360;

    return hslToHex(hue, vectorKey === "aether" ? 42 : 34, vectorKey === "tech" ? 30 : 27);
}

function hslToHex(hue: number, saturation: number, lightness: number) {
    const s = saturation / 100;
    const l = lightness / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = l - c / 2;
    const [r, g, b] = hue < 60
        ? [c, x, 0]
        : hue < 120
            ? [x, c, 0]
            : hue < 180
                ? [0, c, x]
                : hue < 240
                    ? [0, x, c]
                    : hue < 300
                        ? [x, 0, c]
                        : [c, 0, x];

    return (
        (Math.round((r + m) * 255) << 16)
        + (Math.round((g + m) * 255) << 8)
        + Math.round((b + m) * 255)
    );
}
