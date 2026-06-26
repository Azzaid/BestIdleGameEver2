import type { AxialCoordinate, HexCell } from '../city/HexGrid.ts';
import type { BattleBackgroundId } from '../battle/backgrounds.ts';
import type { CityBiome } from '../city/hexBackgrounds.ts';
import type { CityTerrainVectorMap } from '../city/terrainVectors.ts';

export interface CityBattlefieldState {
    backgroundId: BattleBackgroundId;
    detailSeed: number;
}

export interface CityState {
    hexes: HexCell[],
    cellRadius: number,
    maxCellRadius: number,
    terrainVectorMap: CityTerrainVectorMap,
    cityFootprint: number,
    builtStructureIds: string[],
    selectedHex?: AxialCoordinate,
    biome: CityBiome,
    battlefield: CityBattlefieldState,
}
