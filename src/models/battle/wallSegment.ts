import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type BattleWallSegment = {
    cellKey: string;
    wallKey: string | null;
    wallDevelopmentVector: DevelopmentVectorValue | null;
    wallTopKey: string | null;
    wallTopDevelopmentVector: DevelopmentVectorValue | null;
};
