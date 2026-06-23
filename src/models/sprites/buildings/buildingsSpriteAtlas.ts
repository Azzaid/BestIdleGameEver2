import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {SpriteAtlas} from "../SpriteAtlas.ts";
import {ENTITY_VISUAL_ASSETS} from "../../../data/entityVisualAssets.ts";

export const buildingsSpriteAtlas: SpriteAtlas = {
    [DEVELOPMENT_VECTORS.tech]: buildSprites("tech"),
    [DEVELOPMENT_VECTORS.aether]: buildSprites("aether"),
    [DEVELOPMENT_VECTORS.nature]: buildSprites("nature"),
    [DEVELOPMENT_VECTORS.medieval]: buildSprites("medieval"),
};

function buildSprites(vector: "tech" | "aether" | "nature" | "medieval") {
    return Object.fromEntries(
        ENTITY_VISUAL_ASSETS
            .filter(asset => asset.kind === "building" && asset.vector === vector)
            .map(asset => [asset.id, {src: asset.src}]),
    );
}
