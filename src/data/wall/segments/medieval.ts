import {BUILDING_TYPES} from "../../../models/city/BuildingTypes.ts";
import type {WallBuilding} from "../../../models/city/Wall.ts";
import {walls} from "../../identificators/index.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../homogeneousValues/index.ts";

export const medievalWallSegments: Record<string, WallBuilding> = {
    [walls.medieval.scrapBarricade]: {
        id: walls.medieval.scrapBarricade,
        name: "Scrap barricade",
        type: BUILDING_TYPES.wallSegment,
        homogeneousValueEffects: [
            {
                valueId: HOMOGENEOUS_VALUE_IDS.wallResilience,
                additionalKeywords: ["production"],
                additive: 10,
            },
        ],
        specialEffects: [],
        description: "Just a pile of scrap an rubbish to fen off attackers",
    },
};
