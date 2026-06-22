import type {WallBuilding} from "../../models/city/Wall.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues/index.ts";
import {superstructures} from "../identificators/index.ts";
import {createWallSuperstructureFactory} from "./wallSuperstructureFactory.ts";

const tower = createWallSuperstructureFactory({
    vector: DEVELOPMENT_VECTORS.nature,
});

export const natureWallSuperstructures: Record<string, WallBuilding> = {
    [superstructures.nature.graspingRoots]: tower(
        superstructures.nature.graspingRoots,
        "Grasping roots",
        "Living roots wind over the wall, dragging attackers down and shoving them back from the city.",
        {
            keywords: ["slow", "push"],
            values: [
                {
                    valueId: HOMOGENEOUS_VALUE_IDS.monsterSpeedMultiplier,
                    additionalKeywords: ["production", "slow"],
                    additive: -0.2,
                },
                {
                    valueId: HOMOGENEOUS_VALUE_IDS.wallPushBackDistance,
                    additionalKeywords: ["production", "push"],
                    additive: 24,
                },
                {
                    valueId: HOMOGENEOUS_VALUE_IDS.wallPushBacksPerSecond,
                    additionalKeywords: ["production", "push"],
                    additive: 0.5,
                },
                {
                    valueId: HOMOGENEOUS_VALUE_IDS.wallPushBackEffectZoneSize,
                    additionalKeywords: ["production", "push"],
                    additive: 96,
                },
            ],
        },
    ),
};
