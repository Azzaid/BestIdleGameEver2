import type {Building} from "../../models/city/Building.ts";
import {
    BUILDING_TYPES,
    DEVELOPMENT_VECTORS,
} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";

export const techBuildings: {[key: string]: Building} = {
    techProduce1: {
        id: "techProduce1",
        name: "Fossil fuel power plant",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        vector: DEVELOPMENT_VECTORS.tech,
        requiredUpkeep: {},
        requiredUpkeepDescription: {},
        providedUpkeep: {[UPKEEP_TYPES.electricity]: 10},
        providedUpkeepDescription: {[UPKEEP_TYPES.electricity]: "Minor amount (10) of electricity"},
        adjacency: {},
        adjacencyDescription: {},
        description: "A power plant that produces electricity from fossil fuels.",
    },
}