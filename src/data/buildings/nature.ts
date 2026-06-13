import type {Building} from "../../models/city/Building.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";

export const natureBuildings: {[key: string]: Building} = {
    natureBiomass1: {
        id: "natureBiomass1",
        name: "Compost grove",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.nature,
        requiredUpkeep: {},
        requiredUpkeepDescription: {},
        trace: 8,
        providedUpkeep: {[UPKEEP_TYPES.biomass]: 10},
        providedUpkeepDescription: {[UPKEEP_TYPES.biomass]: "Produces 10 biomass"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "Layered fungi, roots, and soil cultures that turn ruins into usable living mass.",
        keywords: ["production", "biomass", "nature", "farm"]
    },
    natureMutagen1: {
        id: "natureMutagen1",
        name: "Mutation vat",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.nature,
        requiredUpkeep: {[UPKEEP_TYPES.biomass]: 3},
        requiredUpkeepDescription: {[UPKEEP_TYPES.biomass]: "Consumes 3 biomass as culture feed"},
        trace: 28,
        providedUpkeep: {[UPKEEP_TYPES.mutagen]: 4},
        providedUpkeepDescription: {[UPKEEP_TYPES.mutagen]: "Produces 4 mutagen"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "A sealed culture pit where controlled stress coaxes useful mutations from living stock.",
        keywords: ["production", "mutagen", "nature", "laboratory"]
    },
}
