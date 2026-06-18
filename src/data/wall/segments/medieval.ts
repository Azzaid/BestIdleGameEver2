import {BUILDING_TYPES} from "../../../models/city/BuildingTypes.ts";
import type {WallBuilding} from "../../../models/city/Wall.ts";
import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {walls} from "../../identificators/index.ts";
import {upkeepAmountToHomogeneousValueEffects} from "../../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues/index.ts";

export const medievalWallSegments: Record<string, WallBuilding> = {
    [walls.medieval.timberBulwark]: {
        id: walls.medieval.timberBulwark,
        name: "Timber bulwark",
        type: BUILDING_TYPES.wallSegment,
        homogeneousValueEffects: [
            ...upkeepAmountToHomogeneousValueEffects({[UPKEEP_TYPES.people]: 2}, "upkeep"),
            {
                valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                additionalKeywords: ["production"],
                additive: 20,
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.cityVisibility,
                additionalKeywords: ["production"],
                additive: -1,
            },
        ],
        specialEffects: [
            {keyword: "push", value: 6, description: "Periodic shove against enemies near the wall"},
        ],
        description: "A fast-built wooden wall line that buys the city its first real safety margin.",
    },
    [walls.medieval.veiledStoneRampart]: {
        id: walls.medieval.veiledStoneRampart,
        name: "Veiled stone rampart",
        type: BUILDING_TYPES.wallSegment,
        homogeneousValueEffects: [
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.manaFlows]: 3,
                [UPKEEP_TYPES.people]: 1,
            }, "upkeep"),
            {
                valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                additionalKeywords: ["production"],
                additive: 160,
            },
            {
                valueId: HOMOGENEOUS_VALUE_IDS.wallThreatSuppression,
                additionalKeywords: ["production"],
                additive: 0.5,
            },
        ],
        specialEffects: [
            {keyword: "slow", value: 12, description: "Slows enemies crossing the approach"},
        ],
        description: "A heavier wall whose warding stones make the city harder to notice.",
    },
};
