import type {SpriteList} from "../SpriteAtlas.ts";
import type {WallSpriteMetadata} from "./WallSpriteAtlas.ts";
import {walls} from "../../../data/ids.ts";

import scrapWallMetadata from "../../../assets/wallSegments/medieval/wall_medieval_scrap-barricade.json";
import scrapWallUrl from "../../../assets/wallSegments/medieval/wall_medieval_scrap-barricade.png";

export const medievalWallSprites: SpriteList<WallSpriteMetadata> = {
    [walls.neutral.scrapBarricade]: {
        src: scrapWallUrl,
        metadata: scrapWallMetadata,
    },
};
