import { techBuildings } from "./tech";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {Building} from "../../models/city/Building.ts";

export type BuildingAtlas = { [k in DevelopmentVectorValue]: {[key: string]: Building} }

export const BUILDINGS_ATLAS: BuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: techBuildings,
    [DEVELOPMENT_VECTORS.nature]: {},
    [DEVELOPMENT_VECTORS.medieval]: {},
    [DEVELOPMENT_VECTORS.aether]: {},
    [DEVELOPMENT_VECTORS.default]: {},
};