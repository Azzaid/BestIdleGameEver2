import type {SpriteList} from "../SpriteAtlas.ts";
import {superstructures} from "../../../data/identificators/index.ts";

import scaffoldTowerBaseUrl from "../../../assets/city/wallTops/medieval/walltop_medieval_scaffold-tower-base.png";

export const medievalWallTopSprites: SpriteList = {
    [superstructures.medieval.scaffoldTowerBase]: scaffoldTowerBaseUrl,
};
