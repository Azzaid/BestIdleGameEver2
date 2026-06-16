import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {WallTopSpriteAtlas, WallTopSpriteMetadataAtlas} from "./WallTopSpriteMetadata.ts";
import {medievalWallTopSpriteMetadata, medievalWallTopSprites} from "./medieval.ts";

export const wallTopSpritesAtlas: WallTopSpriteAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallTopSprites,
    [DEVELOPMENT_VECTORS.aether]: {},
};

export const wallTopSpriteMetadataAtlas: WallTopSpriteMetadataAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallTopSpriteMetadata,
    [DEVELOPMENT_VECTORS.aether]: {},
};
