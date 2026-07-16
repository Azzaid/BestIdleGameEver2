import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {WallBuilding, WallTopCategory} from "../../models/city/Wall.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousDerivedValueEffect, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";

type WallSuperstructureFactoryOptions = {
    vector: DevelopmentVectorValue;
    defaultKeywords?: BuildingKeyword[];
};

type WallSuperstructureOptions = {
    level?: number;
    branch?: string;
    wallTopCategory?: WallTopCategory;
    keywords?: BuildingKeyword[];
    requirements?: Requirement[];
    buildRequirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    derivedValues?: HomogeneousDerivedValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
    visualAssetId?: string;
};

export function createWallSuperstructureFactory({vector, defaultKeywords = []}: WallSuperstructureFactoryOptions) {
    return function tower(
        id: string,
        name: string,
        description: string,
        options: WallSuperstructureOptions = {},
    ): WallBuilding {
        return {
            id,
            name,
            type: BUILDING_TYPES.tower,
            vector,
            level: options.level,
            branch: options.branch,
            wallTopCategory: options.wallTopCategory ?? "wallSuperstructure",
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
