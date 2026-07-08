import type {DevelopmentVectorValue} from "../../DevlopmentVector.ts";
import type {SpriteAtlas} from "../SpriteAtlas.ts";
import type {WallSpriteSize} from "../walls/WallSpriteAtlas.ts";

export type WallTopSpriteAtlas = SpriteAtlas<WallTopSpriteMetadata>;
export type WallTopSpriteMetadataAtlas = Record<DevelopmentVectorValue, Record<string, WallTopSpriteMetadata>>;

export type WallTopSpriteMetadata = {
    sourceSpriteSize: WallSpriteSize;
    targetSpriteSize: WallSpriteSize;
    rotationDegrees?: number;
};
