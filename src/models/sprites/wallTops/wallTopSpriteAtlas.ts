import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {WallTopSpriteAtlas, WallTopSpriteMetadataAtlas} from "./WallTopSpriteMetadata.ts";
import {ENTITY_VISUAL_ASSETS, type WallSuperstructureVisualAsset} from "../../../data/entityVisualAssets.ts";

export const wallTopSpritesAtlas: WallTopSpriteAtlas = {
    [DEVELOPMENT_VECTORS.neutral]: buildWallTopSprites("neutral"),
    [DEVELOPMENT_VECTORS.tech]: buildWallTopSprites("tech"),
    [DEVELOPMENT_VECTORS.nature]: buildWallTopSprites("nature"),
    [DEVELOPMENT_VECTORS.medieval]: buildWallTopSprites("medieval"),
    [DEVELOPMENT_VECTORS.aether]: buildWallTopSprites("aether"),
};

export const wallTopSpriteMetadataAtlas: WallTopSpriteMetadataAtlas = {
    [DEVELOPMENT_VECTORS.neutral]: buildWallTopSpriteMetadata("neutral"),
    [DEVELOPMENT_VECTORS.tech]: buildWallTopSpriteMetadata("tech"),
    [DEVELOPMENT_VECTORS.nature]: buildWallTopSpriteMetadata("nature"),
    [DEVELOPMENT_VECTORS.medieval]: buildWallTopSpriteMetadata("medieval"),
    [DEVELOPMENT_VECTORS.aether]: buildWallTopSpriteMetadata("aether"),
};

function getWallTopAssets(vector: "neutral" | "tech" | "nature" | "medieval" | "aether"): WallSuperstructureVisualAsset[] {
    return ENTITY_VISUAL_ASSETS.filter((asset): asset is WallSuperstructureVisualAsset => (
        asset.kind === "wallSuperstructure" && (
            asset.vector === vector
            || (vector === "neutral" && asset.vector === "medieval")
        )
    ));
}

function buildWallTopSprites(vector: "neutral" | "tech" | "nature" | "medieval" | "aether") {
    return Object.fromEntries(
        getWallTopAssets(vector).map(asset => [asset.id, {src: asset.src, metadata: asset.metadata}]),
    );
}

function buildWallTopSpriteMetadata(vector: "neutral" | "tech" | "nature" | "medieval" | "aether") {
    return Object.fromEntries(
        Object.entries(buildWallTopSprites(vector)).map(([id, asset]) => [id, asset.metadata]),
    );
}
