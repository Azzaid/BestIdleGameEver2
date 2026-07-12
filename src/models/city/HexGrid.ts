import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";
import type {CityHexBackgroundSpriteId} from "./hexBackgrounds.ts";

export type AxialCoordinate = { column: number; row: number };

export type HexCellKind = "city" | "wall";

export type HexCell = AxialCoordinate & {
    cellKey: string;
    isUnclaimed: boolean;
    isLost?: boolean;
    kind: HexCellKind;
    buildingKey: string | null;
    developmentVector: DevelopmentVectorValue;
    backgroundSpriteId: CityHexBackgroundSpriteId;
    backgroundDevelopmentVector: DevelopmentVectorValue;
    baseTerrainSpriteId?: CityHexBackgroundSpriteId;
    baseTerrainDevelopmentVector?: DevelopmentVectorValue;
    spriteKey?: string | null;
    initialBuildingKey?: string | null;
    partOfStructureId?: string | null;
    structureCoreCellKey?: string | null;
    wallKey?: string | null;
    wallDevelopmentVector?: DevelopmentVectorValue;
    wallTopKey?: string | null;
    wallTopDevelopmentVector?: DevelopmentVectorValue;
};
