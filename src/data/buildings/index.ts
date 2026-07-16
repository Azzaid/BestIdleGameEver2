import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey, type DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {Building, BuildingAtlas} from "../../models/city/Building.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {createBuildingFactory} from "./buildingFactory.ts";
import aetherBuildingDefinitions from "./aether.json";
import medievalBuildingDefinitions from "./medieval.json";
import natureBuildingDefinitions from "./nature.json";
import neutralBuildingDefinitions from "./neutral.json";
import techBuildingDefinitions from "./tech.json";

type BuildingDefinition = {
  id: string;
  name: string;
  kind: "building" | "superstructure";
  description: string;
  level?: number;
  branch?: string;
  keywords?: BuildingKeyword[];
  requiredBuildingIds?: string[];
  requiredBuildingSprites?: Record<string, string>;
  hint?: string;
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  adjacencyDescription?: string;
  visualAssetId?: string;
};

const definitionsByVector: Record<DevelopmentVectorKey, readonly BuildingDefinition[]> = {
  neutral: neutralBuildingDefinitions as readonly BuildingDefinition[],
  tech: techBuildingDefinitions as readonly BuildingDefinition[],
  nature: natureBuildingDefinitions as readonly BuildingDefinition[],
  medieval: medievalBuildingDefinitions as readonly BuildingDefinition[],
  aether: aetherBuildingDefinitions as readonly BuildingDefinition[],
};

export type StructureDefinition = {
  id: string;
  name: string;
  vector: DevelopmentVectorKey;
  requiredBuildingIds: string[];
  requiredBuildingSprites?: Record<string, string>;
  description?: string;
  hint: string;
};

export const BUILDINGS_ATLAS: BuildingAtlas = {
  [DEVELOPMENT_VECTORS.neutral]: buildBuildings("neutral"),
  [DEVELOPMENT_VECTORS.tech]: buildBuildings("tech"),
  [DEVELOPMENT_VECTORS.nature]: buildBuildings("nature"),
  [DEVELOPMENT_VECTORS.medieval]: buildBuildings("medieval"),
  [DEVELOPMENT_VECTORS.aether]: buildBuildings("aether"),
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
        requiredBuildingSprites: rule.requiredBuildingSprites,
        description: building.description,
        hint: rule.hint ?? getDefaultStructureHint(rule.requiredBuildingIds),
      }];
    }) ?? []
  ))
));

export const STRUCTURES_BY_ID = Object.fromEntries(
  STRUCTURES.map(structure => [structure.id, structure]),
) as Record<string, StructureDefinition>;

function buildBuildings(vector: DevelopmentVectorKey): Record<string, Building> {
  const {building, superstructure} = createBuildingFactory({
    vector: DEVELOPMENT_VECTORS[vector],
    defaultKeywords: [vector],
  });

  return Object.fromEntries(
    definitionsByVector[vector].map(definition => {
      const create = definition.kind === "superstructure" ? superstructure : building;
      const built = create(
        definition.id,
        definition.name,
        definition.description,
        definition.keywords ?? [],
        {
          requiredBuildingIds: definition.requiredBuildingIds,
          requiredBuildingSprites: definition.requiredBuildingSprites,
          hint: definition.hint,
          level: definition.level,
          branch: definition.branch,
          requirements: getUnlockRequirements(definition),
          buildRequirements: getBuildRequirements(definition),
          values: definition.values,
          effects: definition.effects,
          visualAssetId: definition.visualAssetId,
        },
      );

      return [
        built.id,
        {
          ...built,
          adjacencyDescription: definition.adjacencyDescription ?? built.adjacencyDescription,
        },
      ];
    }),
  );
}

function getUnlockRequirements(definition: BuildingDefinition): Requirement[] | undefined {
  if (definition.kind !== "superstructure" || !definition.requiredBuildingIds?.length) {
    return definition.requirements;
  }

  const requiredBuildingIds = new Set(definition.requiredBuildingIds);
  const requirements = definition.requirements?.filter(requirement => (
    requirement.type !== "buildingExists" || !requiredBuildingIds.has(requirement.buildingId)
  ));

  return requirements?.length ? requirements : undefined;
}

function getBuildRequirements(definition: BuildingDefinition): Requirement[] | undefined {
  if (definition.kind !== "superstructure" || !definition.requiredBuildingIds?.length) {
    return definition.buildRequirements;
  }

  const requiredBuildingRequirements = getRequiredBuildingRequirements(definition.requiredBuildingIds);
  const buildRequirements = [
    ...requiredBuildingRequirements,
    ...(definition.buildRequirements ?? []).filter(requirement => (
      requirement.type !== "buildingExists"
      || !requiredBuildingRequirements.some(required => required.buildingId === requirement.buildingId)
    )),
  ];

  return buildRequirements.length ? buildRequirements : undefined;
}

function getRequiredBuildingRequirements(requiredBuildingIds: readonly string[]): Requirement[] {
  return [...new Set(requiredBuildingIds)].map((buildingId): Requirement => ({
    type: "buildingExists",
    buildingId,
  }));
}

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
