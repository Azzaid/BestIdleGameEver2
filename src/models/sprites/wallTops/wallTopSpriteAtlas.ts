import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {SpriteAtlas} from "../SpriteAtlas.ts";
import {medievalWallTopSprites} from "./medieval.ts";

export const wallTopSpritesAtlas: SpriteAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallTopSprites,
    [DEVELOPMENT_VECTORS.aether]: {},
};
