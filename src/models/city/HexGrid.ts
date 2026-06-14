import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type AxialCoordinate = { column: number; row: number };

export type HexCellKind = "city" | "wall";

export type HexCell = AxialCoordinate & {
    cellKey: string;
    kind: HexCellKind;
    buildingKey: string | null;
    developmentVector: DevelopmentVectorValue
};
