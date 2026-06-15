import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../../models/city/BuildingTypes.ts";
import type {WallBuilding} from "../../../models/city/Wall.ts";

export const medievalWallSuperstructures: Record<string, WallBuilding> = {
    scaffoldTowerBase: {
        id: "scaffoldTowerBase",
        name: "Scaffold tower base",
        type: BUILDING_TYPES.towerBase,
        requiredUpkeep: {[UPKEEP_TYPES.highTechComponents]: 2, [UPKEEP_TYPES.people]: 1},
        requiredUpkeepDescription: {
            [UPKEEP_TYPES.highTechComponents]: "Consumes 2 components for fittings",
            [UPKEEP_TYPES.people]: "Needs 1 loader crew",
        },
        resilience: 10,
        camoLevel: 0,
        ignoredThreat: 0,
        specialEffects: [
            {keyword: "harm", value: 4, description: "Adds a small damage-over-time field around the base"},
        ],
        description: "A light tower foundation that lets fragile weapons sit directly on the wall.",
    },
    repulsorTowerBase: {
        id: "repulsorTowerBase",
        name: "Repulsor tower base",
        type: BUILDING_TYPES.towerBase,
        requiredUpkeep: {[UPKEEP_TYPES.electricity]: 4, [UPKEEP_TYPES.highTechComponents]: 3},
        requiredUpkeepDescription: {
            [UPKEEP_TYPES.electricity]: "Feeds the repulsor coils",
            [UPKEEP_TYPES.highTechComponents]: "Maintains precision emitters",
        },
        resilience: 120,
        camoLevel: 0,
        ignoredThreat: 0,
        specialEffects: [
            {keyword: "push", value: 14, description: "Pushes clustered enemies away from the wall"},
            {keyword: "slow", value: 6, description: "Briefly destabilizes enemy movement"},
        ],
        description: "A reinforced tower base with a crude repulsion engine built into the footing.",
    },
};
