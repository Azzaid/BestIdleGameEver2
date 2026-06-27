import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {WallSpriteAtlas, WallSpriteMetadataAtlas} from "./WallSpriteAtlas.ts";
import {ENTITY_VISUAL_ASSETS, type WallSegmentVisualAsset} from "../../../data/entityVisualAssets.ts";

export const wallSpritesAtlas: WallSpriteAtlas = {
    [DEVELOPMENT_VECTORS.neutral]: buildWallSprites("neutral"),
    [DEVELOPMENT_VECTORS.tech]: buildWallSprites("tech"),
    [DEVELOPMENT_VECTORS.nature]: buildWallSprites("nature"),
    [DEVELOPMENT_VECTORS.medieval]: buildWallSprites("medieval"),
    [DEVELOPMENT_VECTORS.aether]: buildWallSprites("aether"),
};

export const wallSpriteMetadataAtlas: WallSpriteMetadataAtlas = {
    [DEVELOPMENT_VECTORS.neutral]: buildWallSpriteMetadata("neutral"),
    [DEVELOPMENT_VECTORS.tech]: buildWallSpriteMetadata("tech"),
    [DEVELOPMENT_VECTORS.nature]: buildWallSpriteMetadata("nature"),
    [DEVELOPMENT_VECTORS.medieval]: buildWallSpriteMetadata("medieval"),
    [DEVELOPMENT_VECTORS.aether]: buildWallSpriteMetadata("aether"),
};

function getWallAssets(vector: "neutral" | "tech" | "nature" | "medieval" | "aether"): WallSegmentVisualAsset[] {
    return ENTITY_VISUAL_ASSETS.filter((asset): asset is WallSegmentVisualAsset => (
        asset.kind === "wallSegment" && (
            asset.vector === vector
            || (vector === "neutral" && asset.vector === "medieval")
        )
    ));
}

function buildWallSprites(vector: "neutral" | "tech" | "nature" | "medieval" | "aether") {
    return Object.fromEntries(
        getWallAssets(vector).map(asset => [asset.id, {src: asset.src, metadata: asset.metadata}]),
    );
}

function buildWallSpriteMetadata(vector: "neutral" | "tech" | "nature" | "medieval" | "aether") {
    return Object.fromEntries(
        Object.entries(buildWallSprites(vector)).map(([id, asset]) => [id, asset.metadata]),
    );
}
