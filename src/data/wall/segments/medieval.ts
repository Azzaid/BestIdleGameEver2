import type {WallBuilding} from "../../../models/city/Wall.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues/index.ts";
import {technologies, walls} from "../../identificators/index.ts";
import {createWallFactory} from "../wallFactory.ts";
import {requires} from "../../requirements.ts";
import {UPKEEP_TYPES} from "../../../models/Upkeep.ts";

const {segment} = createWallFactory({
    vector: DEVELOPMENT_VECTORS.medieval,
});

export const medievalWallSegments: Record<string, WallBuilding> = {
    [walls.medieval.scrapBarricade]: segment(
        walls.medieval.scrapBarricade,
        "Scrap barricade",
        "Just a pile of scrap an rubbish to fen off attackers",
        {
            values: [
                {
                    valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                    additionalKeywords: ["production"],
                    additive: 6,
                },
            ],
        },
    ),
    [walls.medieval.palisade]: segment(
        walls.medieval.palisade,
        "Palisade",
        "Row of sharpened wood trunks. Strong but require a lot of maintenance",
        {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.timberProcessing),
                requires.buildingKeywordExists("timberwork"),
            ],
            values: [
                {
                    valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                    additionalKeywords: ["production"],
                    additive: 10,
                },
                {
                    valueId: UPKEEP_TYPES.people,
                    additionalKeywords: ["upkeep"],
                    additive: 4,
                },
            ],
        }
    ),
};
