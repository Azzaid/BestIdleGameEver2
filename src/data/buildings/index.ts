import { techBuildings } from "./tech";
import { natureBuildings } from "./nature";
import { medievalBuildings } from "./medieval";
import { aetherBuildings } from "./aether";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import type {BuildingAtlas} from "../../models/city/Building.ts";

export const BUILDINGS_ATLAS: BuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: techBuildings,
    [DEVELOPMENT_VECTORS.nature]: natureBuildings,
    [DEVELOPMENT_VECTORS.medieval]: medievalBuildings,
    [DEVELOPMENT_VECTORS.aether]: aetherBuildings,
};
