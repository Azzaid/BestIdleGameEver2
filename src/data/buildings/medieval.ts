import type {Building} from "../../models/city/Building.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";

export const medievalBuildings: {[key: string]: Building} = {
    medievalPeople1: {
        id: "medievalPeople1",
        name: "Homestead row",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.medieval,
        requiredUpkeep: {},
        requiredUpkeepDescription: {},
        trace: 6,
        providedUpkeep: {[UPKEEP_TYPES.people]: 10},
        providedUpkeepDescription: {[UPKEEP_TYPES.people]: "Provides 10 people"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "Sheltered homes and shared kitchens that keep workers close to the city core.",
        keywords: ["production", "people", "medieval"]
    },
    medievalGold1: {
        id: "medievalGold1",
        name: "Market square",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.medieval,
        requiredUpkeep: {[UPKEEP_TYPES.people]: 3},
        requiredUpkeepDescription: {[UPKEEP_TYPES.people]: "Requires 3 people to staff stalls and ledgers"},
        trace: 14,
        providedUpkeep: {[UPKEEP_TYPES.gold]: 4},
        providedUpkeepDescription: {[UPKEEP_TYPES.gold]: "Produces 4 gold"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "A guarded trade court where labor, favors, salvage, and coin are made legible.",
        keywords: ["production", "gold", "medieval"]
    },
}
