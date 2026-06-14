import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {WallBuilding, WallBuildingAtlas} from "../../models/city/Wall.ts";
import {medievalWallBuildings} from "./medieval.ts";

export const WALL_BUILDINGS_ATLAS: WallBuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: {},
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: medievalWallBuildings,
    [DEVELOPMENT_VECTORS.aether]: {},
};

export const ALL_WALL_BUILDINGS: Record<string, WallBuilding> = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, WallBuilding>>(
    (allWallBuildings, vector) => ({
        ...allWallBuildings,
        ...WALL_BUILDINGS_ATLAS[vector],
    }),
    {},
);

export const WALL_SEGMENT_BUILDINGS = Object.fromEntries(
    Object.entries(ALL_WALL_BUILDINGS).filter(([, building]) => building.type === BUILDING_TYPES.wallSegment),
) as Record<string, WallBuilding>;

export const TOWER_BASE_BUILDINGS = Object.fromEntries(
    Object.entries(ALL_WALL_BUILDINGS).filter(([, building]) => building.type === BUILDING_TYPES.towerBase),
) as Record<string, WallBuilding>;
