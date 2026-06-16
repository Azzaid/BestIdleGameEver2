import type {DevelopmentVectorValue} from "../../DevlopmentVector.ts";
import type {SpriteList} from "../SpriteAtlas.ts";
import type {WallSpriteSize} from "../walls/WallSpriteAtlas.ts";

export type WallTopSpriteAtlas = Record<DevelopmentVectorValue, SpriteList>;
export type WallTopSpriteMetadataAtlas = Record<DevelopmentVectorValue, Record<string, WallTopSpriteMetadata>>;

export type WallTopSpriteMetadata = {
    id: string;
    spriteId: string;
    superstructureId: string;
    sourceSpriteSize: WallSpriteSize;
    targetSpriteSize: WallSpriteSize;
};
