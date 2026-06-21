import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {WallBuilding, WallSpecialEffect} from "../../models/city/Wall.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import type {UpkeepAmount} from "../../models/Upkeep.ts";
import {upkeepAmountToHomogeneousValueEffects} from "../../models/homogeneousValueAdapters.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues/index.ts";

type WallStats = {
    resilience?: number;
    threatSuppression?: number;
};

type WallFactoryOptions = {
    vector: DevelopmentVectorValue;
    defaultKeywords?: BuildingKeyword[];
};

type WallBuildingOptions = {
    keywords?: BuildingKeyword[];
    supportCost?: UpkeepAmount;
    requirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
    specialEffects?: WallSpecialEffect[];
};

const wallStatValueIds: Record<keyof WallStats, string> = {
    resilience: HOMOGENEOUS_VALUE_IDS.wallResilience,
    threatSuppression: HOMOGENEOUS_VALUE_IDS.wallThreatSuppression,
};

export function createWallFactory({vector, defaultKeywords = []}: WallFactoryOptions) {
    function segment(
        id: string,
        name: string,
        description: string,
        stats: WallStats = {},
        options: WallBuildingOptions = {},
    ): WallBuilding {
        return wallBuilding(id, name, description, BUILDING_TYPES.wallSegment, stats, options);
    }

    function tower(
        id: string,
        name: string,
        description: string,
        stats: WallStats = {},
        options: WallBuildingOptions = {},
    ): WallBuilding {
        return wallBuilding(id, name, description, BUILDING_TYPES.tower, stats, options);
    }

    function wallBuilding(
        id: string,
        name: string,
        description: string,
        type: WallBuilding["type"],
        stats: WallStats,
        options: WallBuildingOptions,
    ): WallBuilding {
        const values = [
            ...upkeepAmountToHomogeneousValueEffects(options.supportCost ?? {}, "upkeep"),
            ...wallStatsToHomogeneousValueEffects(stats),
            ...(options.values ?? []),
        ];

        return {
            id,
            name,
            type,
            vector,
            keywords: [...defaultKeywords, ...(options.keywords ?? [])],
            requirements: options.requirements,
            values,
            effects: options.effects,
            specialEffects: options.specialEffects ?? [],
            description,
        };
    }

    return {
        segment,
        tower,
    };
}

function wallStatsToHomogeneousValueEffects(stats: WallStats): HomogeneousValueEffect[] {
    return (Object.entries(stats) as Array<[keyof WallStats, number | undefined]>)
        .flatMap(([stat, additive]) => statToHomogeneousValueEffect(wallStatValueIds[stat], additive));
}

function statToHomogeneousValueEffect(valueId: string, additive: number | undefined): HomogeneousValueEffect[] {
    if (additive === undefined || additive === 0) return [];

    return [{
        valueId,
        additionalKeywords: ["production"],
        additive,
    }];
}
