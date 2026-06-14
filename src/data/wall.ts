import {UPKEEP_TYPES} from "../models/Upkeep.ts";
import {BUILDING_TYPES} from "../models/city/BuildingTypes.ts";
import type {WallBuildingAtlas} from "../models/city/Wall.ts";

export const WALL_BUILDINGS_ATLAS: WallBuildingAtlas = {
    wallSegments: {
        timberBulwark: {
            id: "timberBulwark",
            name: "Timber bulwark",
            type: BUILDING_TYPES.wallSegment,
            requiredUpkeep: {[UPKEEP_TYPES.people]: 2},
            requiredUpkeepDescription: {[UPKEEP_TYPES.people]: "Needs 2 people for patrols and repair"},
            resilience: 90,
            camoLevel: 1,
            ignoredThreat: 2,
            specialEffects: [
                {keyword: "push", value: 6, description: "Periodic shove against enemies near the wall"},
            ],
            description: "A fast-built wooden wall line that buys the city its first real safety margin.",
        },
        veiledStoneRampart: {
            id: "veiledStoneRampart",
            name: "Veiled stone rampart",
            type: BUILDING_TYPES.wallSegment,
            requiredUpkeep: {[UPKEEP_TYPES.mana]: 3, [UPKEEP_TYPES.people]: 1},
            requiredUpkeepDescription: {
                [UPKEEP_TYPES.mana]: "Maintains the low-visibility ward",
                [UPKEEP_TYPES.people]: "Needs 1 keeper crew",
            },
            resilience: 160,
            camoLevel: 3,
            ignoredThreat: 5,
            specialEffects: [
                {keyword: "slow", value: 12, description: "Slows enemies crossing the approach"},
            ],
            description: "A heavier wall whose warding stones make the city harder to notice.",
        },
    },
    towerBases: {
        scaffoldTowerBase: {
            id: "scaffoldTowerBase",
            name: "Scaffold tower base",
            type: BUILDING_TYPES.towerBase,
            requiredUpkeep: {[UPKEEP_TYPES.highTechComponents]: 2, [UPKEEP_TYPES.people]: 1},
            requiredUpkeepDescription: {
                [UPKEEP_TYPES.highTechComponents]: "Consumes 2 components for fittings",
                [UPKEEP_TYPES.people]: "Needs 1 loader crew",
            },
            resilience: 70,
            camoLevel: 0,
            ignoredThreat: 1,
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
            camoLevel: 1,
            ignoredThreat: 3,
            specialEffects: [
                {keyword: "push", value: 14, description: "Pushes clustered enemies away from the wall"},
                {keyword: "slow", value: 6, description: "Briefly destabilizes enemy movement"},
            ],
            description: "A reinforced tower base with a crude repulsion engine built into the footing.",
        },
    },
};

export const ALL_WALL_BUILDINGS = {
    ...WALL_BUILDINGS_ATLAS.wallSegments,
    ...WALL_BUILDINGS_ATLAS.towerBases,
};
