import {CITY_HEX_BACKGROUND_SPRITES_BY_ID, CITY_HEX_BACKGROUND_SPRITE_POOL} from "./cityHexBackgrounds.ts";
import {DEFAULT_INITIAL_CITY_BIOME} from "./constants.ts";
import {
    CITY_HEX_BACKGROUND_TYPES,
    selectCityHexBackgroundSprite,
    type CityBiome,
} from "../models/city/hexBackgrounds.ts";
import type {AxialCoordinate} from "../models/city/HexGrid.ts";
import type {DevelopmentVectorValue} from "../models/DevlopmentVector.ts";

export function selectBaseClaimedTerrainBackground(
    biome: CityBiome,
    vector: DevelopmentVectorValue,
    coordinate: AxialCoordinate,
) {
    return selectCityHexBackgroundSprite(
        CITY_HEX_BACKGROUND_SPRITE_POOL,
        CITY_HEX_BACKGROUND_TYPES.claimedTerrain,
        biome,
        vector,
        createCoordinateRandom(coordinate),
        DEFAULT_INITIAL_CITY_BIOME,
    );
}

export function getCityHexBackgroundSpriteSrc(spriteId: string) {
    return CITY_HEX_BACKGROUND_SPRITES_BY_ID[spriteId]?.src;
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
