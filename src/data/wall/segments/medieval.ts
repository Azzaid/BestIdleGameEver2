import type {WallBuilding} from "../../../models/city/Wall.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
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
        {resilience: 6},
    ),
    [walls.medieval.palisade]: segment(
        walls.medieval.palisade,
        "Palisade",
        "Row of sharpened wood trunks. Strong but require a lot of maintenance",
        {resilience: 10},
        {
            requirements: [
                requires.technologyUnlocked(technologies.medieval.timberProcessing),
                requires.buildingKeywordExists("timberwork"),
            ],
            supportCost: {
                [UPKEEP_TYPES.people]: 4,
            },
        }
    ),
};
