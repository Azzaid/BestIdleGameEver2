import type {CityHexBackgroundSpriteId} from "../city/hexBackgrounds.ts";
import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type BattlefieldTerrainHex = {
    cellKey: string;
    column: number;
    row: number;
    centerX: number;
    centerY: number;
    backgroundSpriteId: CityHexBackgroundSpriteId;
    backgroundSpriteSrc?: string;
    backgroundDevelopmentVector: DevelopmentVectorValue;
    fallbackFill: number;
};
