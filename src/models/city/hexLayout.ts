import type { AxialCoordinate } from './HexGrid.ts';

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export type HasAxial<T> = T & AxialCoordinate;
