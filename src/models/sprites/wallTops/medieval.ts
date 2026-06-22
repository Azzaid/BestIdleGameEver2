import type {SpriteList} from "../SpriteAtlas.ts";
import type {WallTopSpriteMetadata} from "./WallTopSpriteMetadata.ts";
import {superstructures} from "../../../data/ids.ts";

import oldStumpTowerBaseMetadata from "../../../assets/city/wallTops/medieval/walltop_medieval_scaffold-tower-base.json";
import oldStumpTowerBaseUrl from "../../../assets/city/wallTops/medieval/walltop_medieval_scaffold-tower-base.png";

export const medievalWallTopSprites: SpriteList<WallTopSpriteMetadata> = {
    [superstructures.medieval.oldStump]: {
        src: oldStumpTowerBaseUrl,
        metadata: oldStumpTowerBaseMetadata,
    },
};
