import { techBuildings } from "./tech";
import { natureBuildings } from "./nature";
import { medievalBuildings } from "./medieval";
import { aetherBuildings } from "./aether";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {Building, BuildingAtlas} from "../../models/city/Building.ts";

export type StructureDefinition = {
  id: string;
  name: string;
  vector: DevelopmentVectorKey;
  coreBuildingId: string;
  requiredAdjacentBuildingIds: string[];
  description?: string;
};

export const BUILDINGS_ATLAS: BuildingAtlas = {
    [DEVELOPMENT_VECTORS.tech]: techBuildings,
    [DEVELOPMENT_VECTORS.nature]: natureBuildings,
    [DEVELOPMENT_VECTORS.medieval]: medievalBuildings,
    [DEVELOPMENT_VECTORS.aether]: aetherBuildings,
};

export const STRUCTURES: StructureDefinition[] = Object.values(DEVELOPMENT_VECTORS).flatMap(vector => (
    Object.values(BUILDINGS_ATLAS[vector]).flatMap(building => (
        building.multiHexStructure?.flatMap(rule => {
            const resultingBuilding = getBuildingById(rule.resultingBuildingId);
            if (!resultingBuilding) return [];

            return [{
                id: resultingBuilding.id,
                name: resultingBuilding.name,
                vector: getDevelopmentVectorKey(resultingBuilding.vector),
                coreBuildingId: rule.requiredBuildingIds[0],
                requiredAdjacentBuildingIds: rule.requiredBuildingIds.slice(1),
                description: resultingBuilding.description,
            }];
        }) ?? []
    ))
));

export const STRUCTURES_BY_ID = Object.fromEntries(
    STRUCTURES.map(structure => [structure.id, structure]),
) as Record<string, StructureDefinition>;

function getBuildingById(buildingId: string): Building | undefined {
    for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
        const building = BUILDINGS_ATLAS[vector][buildingId];
        if (building) return building;
    }

    return undefined;
}

function getDevelopmentVectorKey(vector: DevelopmentVectorValue): DevelopmentVectorKey {
    const entry = Object.entries(DEVELOPMENT_VECTORS).find(([, value]) => value === vector);
    return entry?.[0] as DevelopmentVectorKey;
}
