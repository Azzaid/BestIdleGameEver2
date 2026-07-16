import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousDerivedValueEffect, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";

type WallSegmentFactoryOptions = {
    vector: DevelopmentVectorValue;
    defaultKeywords?: BuildingKeyword[];
};

type WallSegmentOptions = {
    level?: number;
    branch?: string;
    keywords?: BuildingKeyword[];
    requirements?: Requirement[];
    buildRequirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    derivedValues?: HomogeneousDerivedValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
    visualAssetId?: string;
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
            level: options.level,
            branch: options.branch,
            keywords: [...defaultKeywords, ...(options.keywords ?? [])],
            requirements: options.requirements,
            buildRequirements: options.buildRequirements,
            values: options.values,
            derivedValues: options.derivedValues,
            effects: options.effects,
            visualAssetId: options.visualAssetId,
            description,
        };
    };
}
