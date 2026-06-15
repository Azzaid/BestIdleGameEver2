import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import type {WallBuilding, WallBuildingAtlas} from "../../../models/city/Wall.ts";
import {aetherWallSegments} from "./aether.ts";
import {medievalWallSegments} from "./medieval.ts";
import {natureWallSegments} from "./nature.ts";
import {techWallSegments} from "./tech.ts";

export const WALL_SEGMENTS_ATLAS: WallBuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: techWallSegments,
    [DEVELOPMENT_VECTORS.nature]: natureWallSegments,
    [DEVELOPMENT_VECTORS.medieval]: medievalWallSegments,
    [DEVELOPMENT_VECTORS.aether]: aetherWallSegments,
};

export const WALL_SEGMENT_BUILDINGS: Record<string, WallBuilding> = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, WallBuilding>>(
    (allWallSegments, vector) => ({
        ...allWallSegments,
        ...WALL_SEGMENTS_ATLAS[vector],
    }),
    {},
);
