import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import type {WallBuilding, WallBuildingAtlas} from "../../../models/city/Wall.ts";
import {aetherWallSuperstructures} from "./aether.ts";
import {medievalWallSuperstructures} from "./medieval.ts";
import {natureWallSuperstructures} from "./nature.ts";
import {techWallSuperstructures} from "./tech.ts";

export const WALL_SUPERSTRUCTURES_ATLAS: WallBuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: techWallSuperstructures,
    [DEVELOPMENT_VECTORS.nature]: natureWallSuperstructures,
    [DEVELOPMENT_VECTORS.medieval]: medievalWallSuperstructures,
    [DEVELOPMENT_VECTORS.aether]: aetherWallSuperstructures,
};

export const WALL_SUPERSTRUCTURE_BUILDINGS: Record<string, WallBuilding> = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, WallBuilding>>(
    (allWallSuperstructures, vector) => ({
        ...allWallSuperstructures,
        ...WALL_SUPERSTRUCTURES_ATLAS[vector],
    }),
    {},
);
