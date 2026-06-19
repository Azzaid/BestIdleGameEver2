import type { AxialCoordinate, HexCell } from '../city/HexGrid.ts';
import type { BattleBackgroundId } from '../../data/battle/backgrounds.ts';

export interface CityBattlefieldState {
    backgroundId: BattleBackgroundId;
    detailSeed: number;
}

export interface CityState {
    hexes: HexCell[],
    cellRadius: number,
    cityFootprint: number,
    selectedHex?: AxialCoordinate,
    battlefield: CityBattlefieldState,
}
