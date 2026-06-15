import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import type {WallBuilding, WallBuildingAtlas} from "../../models/city/Wall.ts";
import {WALL_SEGMENT_BUILDINGS, WALL_SEGMENTS_ATLAS} from "./segments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS, WALL_SUPERSTRUCTURES_ATLAS} from "./superstructures/index.ts";

export const WALL_BUILDINGS_ATLAS: WallBuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {
        ...WALL_SEGMENTS_ATLAS[DEVELOPMENT_VECTORS.tech],
        ...WALL_SUPERSTRUCTURES_ATLAS[DEVELOPMENT_VECTORS.tech],
    },
    [DEVELOPMENT_VECTORS.nature]: {
        ...WALL_SEGMENTS_ATLAS[DEVELOPMENT_VECTORS.nature],
        ...WALL_SUPERSTRUCTURES_ATLAS[DEVELOPMENT_VECTORS.nature],
    },
    [DEVELOPMENT_VECTORS.medieval]: {
        ...WALL_SEGMENTS_ATLAS[DEVELOPMENT_VECTORS.medieval],
        ...WALL_SUPERSTRUCTURES_ATLAS[DEVELOPMENT_VECTORS.medieval],
    },
    [DEVELOPMENT_VECTORS.aether]: {
        ...WALL_SEGMENTS_ATLAS[DEVELOPMENT_VECTORS.aether],
        ...WALL_SUPERSTRUCTURES_ATLAS[DEVELOPMENT_VECTORS.aether],
    },
};

export const ALL_WALL_BUILDINGS: Record<string, WallBuilding> = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, WallBuilding>>(
    (allWallBuildings, vector) => ({
        ...allWallBuildings,
        ...WALL_BUILDINGS_ATLAS[vector],
    }),
    {},
);

export {WALL_SEGMENT_BUILDINGS};
export {WALL_SUPERSTRUCTURE_BUILDINGS as TOWER_BASE_BUILDINGS};
