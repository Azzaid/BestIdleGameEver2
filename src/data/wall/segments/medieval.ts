import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../../models/city/BuildingTypes.ts";
import type {WallBuilding} from "../../../models/city/Wall.ts";
import {walls} from "../../identificators/index.ts";

export const medievalWallSegments: Record<string, WallBuilding> = {
    [walls.medieval.timberBulwark]: {
        id: walls.medieval.timberBulwark,
        name: "Timber bulwark",
        type: BUILDING_TYPES.wallSegment,
        requiredUpkeep: {[UPKEEP_TYPES.people]: 2},
        requiredUpkeepDescription: {[UPKEEP_TYPES.people]: "Needs 2 people for patrols and repair"},
        resilience: 20,
        camoLevel: 1,
        ignoredThreat: 0,
        specialEffects: [
            {keyword: "push", value: 6, description: "Periodic shove against enemies near the wall"},
        ],
        description: "A fast-built wooden wall line that buys the city its first real safety margin.",
    },
    [walls.medieval.veiledStoneRampart]: {
        id: walls.medieval.veiledStoneRampart,
        name: "Veiled stone rampart",
        type: BUILDING_TYPES.wallSegment,
        requiredUpkeep: {[UPKEEP_TYPES.mana]: 3, [UPKEEP_TYPES.people]: 1},
        requiredUpkeepDescription: {
            [UPKEEP_TYPES.mana]: "Maintains the low-visibility ward",
            [UPKEEP_TYPES.people]: "Needs 1 keeper crew",
        },
        resilience: 160,
        camoLevel: 0,
        ignoredThreat: 0.5,
        specialEffects: [
            {keyword: "slow", value: 12, description: "Slows enemies crossing the approach"},
        ],
        description: "A heavier wall whose warding stones make the city harder to notice.",
    },
};
