import type { AxialCoordinate, HexCell } from '../city/HexGrid.ts';
import type { BattleBackgroundId } from '../battle/backgrounds.ts';
import type { CityBiome } from '../city/hexBackgrounds.ts';
import type { CityTerrainVectorMap } from '../city/terrainVectors.ts';

export interface CityBattlefieldState {
    backgroundId: BattleBackgroundId;
    detailSeed: number;
}

export interface CityFrontierRadii {
    east: number;
    southEast: number;
    southWest: number;
    west: number;
    northWest: number;
    northEast: number;
}

export interface CityState {
    hexes: HexCell[],
    cellRadius: number,
    maxCellRadius: number,
    frontiers: CityFrontierRadii,
    terrainVectorMap: CityTerrainVectorMap,
    cityFootprint: number,
    builtStructureIds: string[],
    selectedHex?: AxialCoordinate,
    biome: CityBiome,
    battlefield: CityBattlefieldState,
}
