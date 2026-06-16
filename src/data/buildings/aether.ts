import type {Building} from "../../models/city/Building.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import {buildings} from "../identificators/index.ts";

export const aetherBuildings: {[key: string]: Building} = {
    [buildings.aether.leylineWell]: {
        id: buildings.aether.leylineWell,
        name: "Leyline well",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        isMultistructure: false,
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
    [buildings.aether.runeScriptorium]: {
        id: buildings.aether.runeScriptorium,
        name: "Rune scriptorium",
        type: BUILDING_TYPES.produce,
        level:1,
        size:1,
        isMultiHex: false,
        isMultistructure: false,
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
    [buildings.aether.dolmen]: {
        id: buildings.aether.dolmen,
        name: "Dolmen",
        type: BUILDING_TYPES.produce,
        level: 1,
        size: 1,
        isMultiHex: false,
        isMultistructure: false,
        vector: DEVELOPMENT_VECTORS.aether,
        requiredUpkeep: {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 2},
        requiredUpkeepDescription: {
            [UPKEEP_TYPES.people]: "Needs 2 keepers to manage visitors and rites",
            [UPKEEP_TYPES.gold]: "Consumes 2 value in offerings and carved stones",
        },
        trace: 20,
        providedUpkeep: {[UPKEEP_TYPES.mana]: 4},
        providedUpkeepDescription: {[UPKEEP_TYPES.mana]: "Produces 4 unstable mana through early ritual practice"},
        adjacency: [],
        adjacencyDescription: "Not affected",
        description: "A raised stone place where market gossip becomes omen, ritual, and a very nervous kind of accounting.",
        keywords: ["production", "mana", "aether", "ritual"]
    },
    [buildings.aether.shamanHut]: {
        id: buildings.aether.shamanHut,
        name: "Shaman hut",
        type: BUILDING_TYPES.produce,
        level: 1,
        size: 1,
        isMultiHex: false,
        isMultistructure: false,
        vector: DEVELOPMENT_VECTORS.aether,
        requiredUpkeep: {[UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.mana]: 2},
        requiredUpkeepDescription: {
            [UPKEEP_TYPES.people]: "Needs 3 attendants, patients, and witnesses",
            [UPKEEP_TYPES.mana]: "Consumes 2 mana in repeated rites",
        },
        trace: 26,
        providedUpkeep: {[UPKEEP_TYPES.mana]: 7, [UPKEEP_TYPES.arcaneSupplies]: 1},
        providedUpkeepDescription: {
            [UPKEEP_TYPES.mana]: "Produces 7 mana",
            [UPKEEP_TYPES.arcaneSupplies]: "Produces 1 early arcane supply",
        },
        adjacency: [],
        adjacencyDescription: "Not affected",
        description: "A dangerous compromise between medicine, prophecy, and weaponized superstition.",
        keywords: ["production", "mana", "arcane", "aether", "ritual"]
    },
}
