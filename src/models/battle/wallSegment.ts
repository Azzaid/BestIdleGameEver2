import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type BattleWallSegment = {
    cellKey: string;
    column: number;
    row: number;
    wallKey: string | null;
    wallDevelopmentVector: DevelopmentVectorValue | null;
    wallTopKey: string | null;
    wallTopDevelopmentVector: DevelopmentVectorValue | null;
};
