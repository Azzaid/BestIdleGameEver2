import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";

type WallFactoryOptions = {
    vector: DevelopmentVectorValue;
    defaultKeywords?: BuildingKeyword[];
};

type WallBuildingOptions = {
    keywords?: BuildingKeyword[];
    requirements?: Requirement[];
    buildRequirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
};

export function createWallFactory({vector, defaultKeywords = []}: WallFactoryOptions) {
    function segment(
        id: string,
        name: string,
        description: string,
        options: WallBuildingOptions = {},
    ): WallBuilding {
        return wallBuilding(id, name, description, BUILDING_TYPES.wallSegment, options);
    }

    function tower(
        id: string,
        name: string,
        description: string,
        options: WallBuildingOptions = {},
    ): WallBuilding {
        return wallBuilding(id, name, description, BUILDING_TYPES.tower, options);
    }

    function wallBuilding(
        id: string,
        name: string,
        description: string,
        type: WallBuilding["type"],
        options: WallBuildingOptions,
    ): WallBuilding {
        return {
            id,
            name,
            type,
            vector,
            keywords: [...defaultKeywords, ...(options.keywords ?? [])],
            requirements: options.requirements,
            buildRequirements: options.buildRequirements,
            values: options.values,
            effects: options.effects,
            description,
        };
    }

    return {
        segment,
        tower,
    };
}
