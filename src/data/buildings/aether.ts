import type {Building} from "../../models/city/Building.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";

export const aetherBuildings: {[key: string]: Building} = {
    aetherMana1: {
        id: "aetherMana1",
        name: "Leyline well",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.aether,
        requiredUpkeep: {},
        requiredUpkeepDescription: {},
        trace: 18,
        providedUpkeep: {[UPKEEP_TYPES.mana]: 10},
        providedUpkeepDescription: {[UPKEEP_TYPES.mana]: "Produces 10 mana"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "A quiet anchor sunk into the city grid to draw stable mana from buried currents.",
        keywords: ["production", "mana", "aether", "shrine"]
    },
    aetherSupplies1: {
        id: "aetherSupplies1",
        name: "Rune scriptorium",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        vector: DEVELOPMENT_VECTORS.aether,
        requiredUpkeep: {[UPKEEP_TYPES.mana]: 3},
        requiredUpkeepDescription: {[UPKEEP_TYPES.mana]: "Consumes 3 mana to charge inscriptions"},
        trace: 30,
        providedUpkeep: {[UPKEEP_TYPES.arcaneSupplies]: 4},
        providedUpkeepDescription: {[UPKEEP_TYPES.arcaneSupplies]: "Produces 4 arcane supplies"},
        adjacency: [],
        adjacencyDescription: 'Not affected',
        description: "Scribes bind powders, lenses, and sigils into supplies that hold a spell under pressure.",
        keywords: ["production", "arcane", "aether", "laboratory"]
    },
}
