import type {SpriteList} from "../SpriteAtlas.ts";
import type {WallTopSpriteMetadata} from "./WallTopSpriteMetadata.ts";
import {superstructures} from "../../../data/ids.ts";

import oldStumpTowerBaseMetadata from "../../../assets/wallSuperstructures/medieval/walltop_medieval_old-stump.json";
import oldStumpTowerBaseUrl from "../../../assets/wallSuperstructures/medieval/walltop_medieval_old-stump.png";

export const medievalWallTopSprites: SpriteList<WallTopSpriteMetadata> = {
    [superstructures.neutral.oldStump]: {
        src: oldStumpTowerBaseUrl,
        metadata: oldStumpTowerBaseMetadata,
    },
};
