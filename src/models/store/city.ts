import type { AxialCoordinate, HexCell } from '../city/HexGrid.ts';

export interface CityState {
    hexes: HexCell[],
    cellRadius: number,
    selectedHex?: AxialCoordinate,
}
