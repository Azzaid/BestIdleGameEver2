import {BUILDING_TYPES} from "../../../models/city/BuildingTypes.ts";
import type {WallBuilding} from "../../../models/city/Wall.ts";
import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {superstructures} from "../../identificators/index.ts";
import {upkeepAmountToHomogeneousValueEffects} from "../../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues/index.ts";

export const medievalWallSuperstructures: Record<string, WallBuilding> = {
    [superstructures.medieval.scaffoldTowerBase]: {
        id: superstructures.medieval.scaffoldTowerBase,
        name: "Scaffold tower platform",
        type: BUILDING_TYPES.towerBase,
        homogeneousValueEffects: [
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.compute]: 2,
                [UPKEEP_TYPES.people]: 1,
            }, "upkeep"),
            {
                valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                additionalKeywords: ["production"],
                additive: 10,
            },
        ],
        specialEffects: [
            {keyword: "harm", value: 4, description: "Adds a small damage-over-time field around the platform"},
        ],
        description: "A light scaffold platform using the crude wood turret frame, giving one tower room to rotate on the wall.",
    },
    [superstructures.medieval.repulsorTowerBase]: {
        id: superstructures.medieval.repulsorTowerBase,
        name: "Repulsor tower platform",
        type: BUILDING_TYPES.towerBase,
        homogeneousValueEffects: [
            ...upkeepAmountToHomogeneousValueEffects({
                [UPKEEP_TYPES.power]: 4,
                [UPKEEP_TYPES.compute]: 3,
            }, "upkeep"),
            {
                valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                additionalKeywords: ["production"],
                additive: 120,
            },
        ],
        specialEffects: [
            {keyword: "push", value: 14, description: "Pushes clustered enemies away from the wall"},
            {keyword: "slow", value: 6, description: "Briefly destabilizes enemy movement"},
        ],
        description: "A reinforced tower platform with a crude repulsion engine built into the footing.",
    },
};
