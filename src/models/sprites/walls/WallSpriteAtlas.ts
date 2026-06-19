import type {DevelopmentVectorValue} from "../../DevlopmentVector.ts";
import type {SpriteList} from "../SpriteAtlas.ts";

export type WallSpriteAtlas = Record<DevelopmentVectorValue, SpriteList>;
export type WallSpriteMetadataAtlas = Record<DevelopmentVectorValue, Record<string, WallSpriteMetadata>>;

export type WallSpriteSize = {
    width: number;
    height: number;
};

export type WallSpriteBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type WallSpriteMetadata = {
    sourceSpriteSize: WallSpriteSize;
    targetSpriteSize: WallSpriteSize;
    sourceVisiblePixelBounds?: WallSpriteBounds;
};
