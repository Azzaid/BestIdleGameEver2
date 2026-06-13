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
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.tech,
        requiredUpkeep: {},
        requiredUpkeepDescription: {},
        trace: 100,
        providedUpkeep: {[UPKEEP_TYPES.electricity]: 10},
        providedUpkeepDescription: {[UPKEEP_TYPES.electricity]: "Minor amount (10) of electricity"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "A power plant that produces electricity from fossil fuels.",
        keywords: ["production", "electricity", "tech", "generator"]
    },
    techComponents1: {
        id: "techComponents1",
        name: "Machine shop",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.tech,
        requiredUpkeep: {[UPKEEP_TYPES.electricity]: 3},
        requiredUpkeepDescription: {[UPKEEP_TYPES.electricity]: "Consumes 3 electricity to run precision tools"},
        trace: 35,
        providedUpkeep: {[UPKEEP_TYPES.highTechComponents]: 4},
        providedUpkeepDescription: {[UPKEEP_TYPES.highTechComponents]: "Produces 4 high tech components"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "A compact workshop that turns powered tools and salvage into reliable machine parts.",
        keywords: ["production", "highTechComponents", "tech"]
    },
}
