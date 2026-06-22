import type {WallBuilding} from "../../../models/city/Wall.ts";
import {technologies, walls} from "../../identificators";
import {requires} from "../../requirements.ts";
import {createWallFactory} from "../wallFactory.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues";

const {segment} = createWallFactory({
    vector: DEVELOPMENT_VECTORS.nature,
});

export const natureWallSegments: Record<string, WallBuilding> = {
    [walls.nature.livingWoodPalisade]: segment(
        walls.medieval.palisade,
        "Living wood palisade",
        "Tight row of a strong young trees. Can heal itself and require no maintenance. But fragile to ecosystem changes.",
        {resilience: 10},
        {
            requirements: [
                requires.technologyUnlocked(technologies.nature.livingWood),
            ],
            buildRequirements: [
                requires.homogeneousValueLessThan(HOMOGENEOUS_VALUE_IDS.natureBioDisbalance, 3),
            ],
            supportCost: {},
        }
    ),
};
