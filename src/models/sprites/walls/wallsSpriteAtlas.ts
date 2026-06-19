import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {WallSpriteAtlas, WallSpriteMetadataAtlas} from "./WallSpriteAtlas.ts";
import {medievalWallSprites} from "./medieval.ts";

export const wallSpritesAtlas: WallSpriteAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallSprites,
    [DEVELOPMENT_VECTORS.aether]: {},
};

export const wallSpriteMetadataAtlas: WallSpriteMetadataAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: Object.fromEntries(
        Object.entries(medievalWallSprites).map(([id, asset]) => [id, asset.metadata])
    ) as Record<string, NonNullable<(typeof medievalWallSprites)[string]["metadata"]>>,
    [DEVELOPMENT_VECTORS.aether]: {},
};
