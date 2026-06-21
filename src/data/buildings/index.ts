import { techBuildings } from "./tech";
import { natureBuildings } from "./nature";
import { medievalBuildings } from "./medieval";
import { aetherBuildings } from "./aether";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {BuildingAtlas} from "../../models/city/Building.ts";

export type StructureDefinition = {
  id: string;
  name: string;
  vector: DevelopmentVectorKey;
  requiredBuildingIds: string[];
  description?: string;
  hint: string;
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
            if (!rule.requiredBuildingIds.length) return [];

            return [{
                id: building.id,
                name: building.name,
                vector: getDevelopmentVectorKey(building.vector),
                requiredBuildingIds: rule.requiredBuildingIds,
                description: building.description,
                hint: rule.hint ?? getDefaultStructureHint(rule.requiredBuildingIds),
            }];
        }) ?? []
    ))
));

export const STRUCTURES_BY_ID = Object.fromEntries(
    STRUCTURES.map(structure => [structure.id, structure]),
) as Record<string, StructureDefinition>;

function getDevelopmentVectorKey(vector: DevelopmentVectorValue): DevelopmentVectorKey {
    const entry = Object.entries(DEVELOPMENT_VECTORS).find(([, value]) => value === vector);
    return entry?.[0] as DevelopmentVectorKey;
}

function getDefaultStructureHint(requiredBuildingIds: readonly string[]): string {
    const countsByName = new Map<string, number>();

    for (const buildingId of requiredBuildingIds) {
        const building = getBuildingById(buildingId);
        const name = building?.name ?? buildingId;
        countsByName.set(name, (countsByName.get(name) ?? 0) + 1);
    }

    const parts = [...countsByName.entries()].map(([name, count]) => (
        count === 1 ? name : `${count} ${name}s`
    ));

    return `Place ${formatList(parts)} in one connected cluster.`;
}

function getBuildingById(buildingId: string) {
    for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
        const building = BUILDINGS_ATLAS[vector][buildingId];
        if (building) return building;
    }

    return undefined;
}

function formatList(parts: readonly string[]): string {
    if (parts.length <= 1) return parts[0] ?? "the required buildings";
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;

    return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}
