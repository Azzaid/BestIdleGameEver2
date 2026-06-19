import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {WallTopSpriteAtlas, WallTopSpriteMetadataAtlas} from "./WallTopSpriteMetadata.ts";
import {medievalWallTopSprites} from "./medieval.ts";

export const wallTopSpritesAtlas: WallTopSpriteAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallTopSprites,
    [DEVELOPMENT_VECTORS.aether]: {},
};

export const wallTopSpriteMetadataAtlas: WallTopSpriteMetadataAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: Object.fromEntries(
        Object.entries(medievalWallTopSprites).map(([id, asset]) => [id, asset.metadata])
    ) as Record<string, NonNullable<(typeof medievalWallTopSprites)[string]["metadata"]>>,
    [DEVELOPMENT_VECTORS.aether]: {},
};
