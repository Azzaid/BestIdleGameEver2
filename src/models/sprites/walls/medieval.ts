import type {SpriteList} from "../SpriteAtlas.ts";
import type {WallSpriteMetadata} from "./WallSpriteAtlas.ts";
import {walls} from "../../../data/identificators/index.ts";

import scrapWallMetadata from "../../../assets/city/walls/medieval/wall_medieval_timber-bulwark.json";
import scrapWallUrl from "../../../assets/city/walls/medieval/wall_medieval_timber-bulwark.png";

export const medievalWallSprites: SpriteList = {
    [walls.medieval.timberBulwark]: scrapWallUrl,
};

export const medievalWallSpriteMetadata: Record<string, WallSpriteMetadata> = {
    [walls.medieval.timberBulwark]: scrapWallMetadata,
};
