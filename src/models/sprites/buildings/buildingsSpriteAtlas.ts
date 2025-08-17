import {DEVELOPMENT_VECTORS} from "../../DevlopmentVector.ts";
import type {SpriteAtlas} from "../SpriteAtlas.ts";

import {techBuildingsSprites} from "./tech.ts";

export const buildingsSpriteAtlas: SpriteAtlas = {
    [DEVELOPMENT_VECTORS.tech]: techBuildingsSprites,
    [DEVELOPMENT_VECTORS.default]:{},
    [DEVELOPMENT_VECTORS.aether]:{},
    [DEVELOPMENT_VECTORS.nature]:{},
    [DEVELOPMENT_VECTORS.medieval]:{},
};