import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type AxialCoordinate = { column: number; row: number };

export type HexCell = AxialCoordinate & {
    buildingKey: string | null;
    developmentVector: DevelopmentVectorValue
};