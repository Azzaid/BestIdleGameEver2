import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {WallSpriteAtlas, WallSpriteMetadataAtlas} from "./WallSpriteAtlas.ts";
import {medievalWallSprites, medievalWallSpriteMetadata} from "./medieval.ts";

export const wallSpritesAtlas: WallSpriteAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallSprites,
    [DEVELOPMENT_VECTORS.aether]: {},
};

export const wallSpriteMetadataAtlas: WallSpriteMetadataAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallSpriteMetadata,
    [DEVELOPMENT_VECTORS.aether]: {},
};
