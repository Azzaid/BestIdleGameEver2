import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../../models/DevlopmentVector.ts";
import type {BuildingKeyword} from "../../../models/city/Keywords.ts";
import type {WallBuilding, WallBuildingAtlas} from "../../../models/city/Wall.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../../models/homogeneousValues.ts";
import type {Requirement} from "../../../models/progression/requirements.ts";
import {createWallFactory} from "../wallFactory.ts";
import aetherWallSegmentDefinitions from "./aether.json";
import medievalWallSegmentDefinitions from "./medieval.json";
import natureWallSegmentDefinitions from "./nature.json";
import techWallSegmentDefinitions from "./tech.json";

type WallSegmentDefinition = {
    id: string;
    name: string;
    description: string;
    keywords?: BuildingKeyword[];
    requirements?: Requirement[];
    buildRequirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
};

const wallSegmentDefinitionsByVector: Record<DevelopmentVectorKey, readonly WallSegmentDefinition[]> = {
    tech: techWallSegmentDefinitions as readonly WallSegmentDefinition[],
    nature: natureWallSegmentDefinitions as readonly WallSegmentDefinition[],
    medieval: medievalWallSegmentDefinitions as readonly WallSegmentDefinition[],
    aether: aetherWallSegmentDefinitions as readonly WallSegmentDefinition[],
};

export const WALL_SEGMENTS_ATLAS: WallBuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: buildWallSegments("tech"),
    [DEVELOPMENT_VECTORS.nature]: buildWallSegments("nature"),
    [DEVELOPMENT_VECTORS.medieval]: buildWallSegments("medieval"),
    [DEVELOPMENT_VECTORS.aether]: buildWallSegments("aether"),
};

export const WALL_SEGMENT_BUILDINGS: Record<string, WallBuilding> = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, WallBuilding>>(
    (allWallSegments, vector) => ({
        ...allWallSegments,
        ...WALL_SEGMENTS_ATLAS[vector],
    }),
    {},
);

function buildWallSegments(vector: DevelopmentVectorKey): Record<string, WallBuilding> {
    const {segment} = createWallFactory({
        vector: DEVELOPMENT_VECTORS[vector],
    });

    return Object.fromEntries(
        wallSegmentDefinitionsByVector[vector].map(definition => [
            definition.id,
            segment(
                definition.id,
                definition.name,
                definition.description,
                {
                    keywords: definition.keywords,
                    requirements: definition.requirements,
                    buildRequirements: definition.buildRequirements,
                    values: definition.values,
                    effects: definition.effects,
                },
            ),
        ]),
    );
}
