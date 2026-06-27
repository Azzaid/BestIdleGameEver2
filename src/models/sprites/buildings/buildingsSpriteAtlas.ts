import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {SpriteAtlas} from "../SpriteAtlas.ts";
import {ENTITY_VISUAL_ASSETS, type BuildingVisualAsset} from "../../../data/entityVisualAssets.ts";
import type {BuildingSpriteMetadata} from "./BuildingSpriteMetadata.ts";

export const buildingsSpriteAtlas: SpriteAtlas<BuildingSpriteMetadata> = {
    [DEVELOPMENT_VECTORS.neutral]: buildSprites("neutral"),
    [DEVELOPMENT_VECTORS.tech]: buildSprites("tech"),
    [DEVELOPMENT_VECTORS.aether]: buildSprites("aether"),
    [DEVELOPMENT_VECTORS.nature]: buildSprites("nature"),
    [DEVELOPMENT_VECTORS.medieval]: buildSprites("medieval"),
};

function buildSprites(vector: "neutral" | "tech" | "aether" | "nature" | "medieval") {
    return Object.fromEntries(
        ENTITY_VISUAL_ASSETS
            .filter((asset): asset is BuildingVisualAsset => asset.kind === "building" && (
                asset.vector === vector
                || (vector === "neutral" && asset.vector === "medieval")
            ))
            .flatMap(asset => [
                [asset.id, {src: asset.src, metadata: asset.metadata}] as const,
                [asset.fileStem, {src: asset.src, metadata: asset.metadata}] as const,
            ]),
    );
}
