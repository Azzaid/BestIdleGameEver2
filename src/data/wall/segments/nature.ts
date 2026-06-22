import type {WallBuilding} from "../../../models/city/Wall.ts";
import {technologies, walls} from "../../identificators/index.ts";
import {requires} from "../../requirements.ts";
import {createWallFactory} from "../wallFactory.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues/index.ts";

const {segment} = createWallFactory({
    vector: DEVELOPMENT_VECTORS.nature,
});

export const natureWallSegments: Record<string, WallBuilding> = {
    [walls.nature.livingWoodPalisade]: segment(
        walls.nature.livingWoodPalisade,
        "Living wood palisade",
        "Tight row of a strong young trees. Can heal itself and require no maintenance. But fragile to ecosystem changes.",
        {
            requirements: [
                requires.technologyUnlocked(technologies.nature.livingWood),
            ],
            buildRequirements: [
                requires.homogeneousValueLessThan(HOMOGENEOUS_VALUE_IDS.natureBioDisbalance, 3),
            ],
            values: [
                {
                    valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                    additionalKeywords: ["production"],
                    additive: 10,
                },
            ],
        }
    ),
};
