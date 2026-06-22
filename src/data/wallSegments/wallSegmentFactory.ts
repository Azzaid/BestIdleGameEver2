import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";

type WallSegmentFactoryOptions = {
    vector: DevelopmentVectorValue;
    defaultKeywords?: BuildingKeyword[];
};

type WallSegmentOptions = {
    keywords?: BuildingKeyword[];
    requirements?: Requirement[];
    buildRequirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
};

export function createWallSegmentFactory({vector, defaultKeywords = []}: WallSegmentFactoryOptions) {
    return function segment(
        id: string,
        name: string,
        description: string,
        options: WallSegmentOptions = {},
    ): WallBuilding {
        return {
            id,
            name,
            type: BUILDING_TYPES.wallSegment,
            vector,
            keywords: [...defaultKeywords, ...(options.keywords ?? [])],
            requirements: options.requirements,
            buildRequirements: options.buildRequirements,
            values: options.values,
            effects: options.effects,
            description,
        };
    };
}
