import { techBuildings } from "./tech";
import { natureBuildings } from "./nature";
import { medievalBuildings } from "./medieval";
import { aetherBuildings } from "./aether";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {Building} from "../../models/city/Building.ts";

export type BuildingAtlas = { [k in DevelopmentVectorValue]: {[key: string]: Building} }

export const BUILDINGS_ATLAS: BuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: techBuildings,
    [DEVELOPMENT_VECTORS.nature]: natureBuildings,
    [DEVELOPMENT_VECTORS.medieval]: medievalBuildings,
    [DEVELOPMENT_VECTORS.aether]: aetherBuildings,
    [DEVELOPMENT_VECTORS.default]: {},
};
