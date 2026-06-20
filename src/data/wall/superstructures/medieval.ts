import type {WallBuilding} from "../../../models/city/Wall.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";
import {superstructures} from "../../identificators/index.ts";
import {createWallFactory} from "../wallFactory.ts";

const {tower} = createWallFactory({
    vector: DEVELOPMENT_VECTORS.medieval,
});

export const medievalWallSuperstructures: Record<string, WallBuilding> = {
    [superstructures.medieval.scaffoldTowerBase]: tower(
        superstructures.medieval.scaffoldTowerBase,
        "Scaffold tower",
        "A light scaffold tower giving one mounted gun room to rotate on the wall.",
        {resilience: 10},
        {
            supportCost: {
                [UPKEEP_TYPES.compute]: 2,
                [UPKEEP_TYPES.people]: 1,
            },
            mountedGunStats: {
                rotationSpeed: 0.25,
            },
            specialEffects: [
                {keyword: "harm", value: 4, description: "Adds a small damage-over-time field around the tower"},
            ],
        },
    ),
    [superstructures.medieval.repulsorTowerBase]: tower(
        superstructures.medieval.repulsorTowerBase,
        "Repulsor tower",
        "A reinforced tower with a crude repulsion engine built into the footing.",
        {resilience: 120},
        {
            supportCost: {
                [UPKEEP_TYPES.power]: 4,
                [UPKEEP_TYPES.compute]: 3,
            },
            mountedGunStats: {
                projectileSpread: -0.1,
            },
            specialEffects: [
                {keyword: "push", value: 14, description: "Pushes clustered enemies away from the wall"},
                {keyword: "slow", value: 6, description: "Briefly destabilizes enemy movement"},
            ],
        },
    ),
};
