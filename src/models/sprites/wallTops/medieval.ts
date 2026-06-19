import type {SpriteList} from "../SpriteAtlas.ts";
import type {WallTopSpriteMetadata} from "./WallTopSpriteMetadata.ts";
import {superstructures} from "../../../data/identificators/index.ts";

import scaffoldTowerBaseMetadata from "../../../assets/city/wallTops/medieval/walltop_medieval_scaffold-tower-base.json";
import scaffoldTowerBaseUrl from "../../../assets/city/wallTops/medieval/walltop_medieval_scaffold-tower-base.png";

export const medievalWallTopSprites: SpriteList<WallTopSpriteMetadata> = {
    [superstructures.medieval.scaffoldTowerBase]: {
        src: scaffoldTowerBaseUrl,
        metadata: scaffoldTowerBaseMetadata,
    },
};
