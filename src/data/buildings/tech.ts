import type {Building} from "../../models/city/Building.ts";
import {
    DEVELOPMENT_VECTORS,
} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";

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
        trace: 100,
        providedUpkeep: {[UPKEEP_TYPES.electricity]: 10},
        providedUpkeepDescription: {[UPKEEP_TYPES.electricity]: "Minor amount (10) of electricity"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "A power plant that produces electricity from fossil fuels.",
        keywords: []
    },
}