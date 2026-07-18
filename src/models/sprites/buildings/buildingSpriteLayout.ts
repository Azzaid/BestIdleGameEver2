import {CITY_HEX_WIDTH} from "../../../data/constants.ts";
import type {BuildingSpriteMetadata} from "./BuildingSpriteMetadata.ts";

export const BUILDING_SPRITE_HEX_WIDTH_RATIO = 0.98;

export function getBuildingSpriteSize(metadata?: Pick<BuildingSpriteMetadata, "zoom">) {
    const zoom = Number.isFinite(metadata?.zoom)
        ? Math.max(0.01, metadata?.zoom ?? 1)
        : 1;
    const side = CITY_HEX_WIDTH * BUILDING_SPRITE_HEX_WIDTH_RATIO * zoom;

    return {
        width: side,
        height: side,
    };
}
