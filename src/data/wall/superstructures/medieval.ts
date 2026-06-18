import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../../models/city/BuildingTypes.ts";
import type {WallBuilding} from "../../../models/city/Wall.ts";
import {superstructures} from "../../identificators/index.ts";

export const medievalWallSuperstructures: Record<string, WallBuilding> = {
    [superstructures.medieval.scaffoldTowerBase]: {
        id: superstructures.medieval.scaffoldTowerBase,
        name: "Scaffold tower platform",
        type: BUILDING_TYPES.towerBase,
        requiredUpkeep: {[UPKEEP_TYPES.compute]: 2, [UPKEEP_TYPES.people]: 1},
        requiredUpkeepDescription: {
            [UPKEEP_TYPES.compute]: "Consumes 2 compute for fittings",
            [UPKEEP_TYPES.people]: "Needs 1 loader crew",
        },
        resilience: 10,
        camoLevel: 0,
        ignoredThreat: 0,
        specialEffects: [
            {keyword: "harm", value: 4, description: "Adds a small damage-over-time field around the platform"},
        ],
        description: "A light scaffold platform using the crude wood turret frame, giving one tower room to rotate on the wall.",
    },
    [superstructures.medieval.repulsorTowerBase]: {
        id: superstructures.medieval.repulsorTowerBase,
        name: "Repulsor tower platform",
        type: BUILDING_TYPES.towerBase,
        requiredUpkeep: {[UPKEEP_TYPES.power]: 4, [UPKEEP_TYPES.compute]: 3},
        requiredUpkeepDescription: {
            [UPKEEP_TYPES.power]: "Feeds the repulsor coils",
            [UPKEEP_TYPES.compute]: "Maintains precision emitters",
        },
        resilience: 120,
        camoLevel: 0,
        ignoredThreat: 0,
        specialEffects: [
            {keyword: "push", value: 14, description: "Pushes clustered enemies away from the wall"},
            {keyword: "slow", value: 6, description: "Briefly destabilizes enemy movement"},
        ],
        description: "A reinforced tower platform with a crude repulsion engine built into the footing.",
    },
};
