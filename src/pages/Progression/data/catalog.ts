import {BUILDINGS_ATLAS} from "../../../data/buildings/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../../data/wallSegments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS} from "../../../data/wallSuperstructures/index.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey, type DevelopmentVectorValue} from "../../../models/DevlopmentVector.ts";
import {researchGraphValidationErrors, researchTree} from "../../../data/research/index.ts";
import {TOWER_PARTS} from "../../../data/gunParts/index.ts";
import {buildProgressionGraph, validateProgressionGraph} from "./progression.ts";
import {PROGRESSION_RULES} from "./rules.ts";
import {getProgressionNodeVectorFromId} from "./nodeIdentity.ts";
import type {ProgressionRegistry, ProgressionRegistryEntry} from "./types.ts";

const buildingEntries = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, ProgressionRegistryEntry>>(
  (entries, vector) => {
    for (const building of Object.values(BUILDINGS_ATLAS[vector])) {
      entries[building.id] = {
        name: building.name,
        vector: getDevelopmentVectorKey(building.vector),
        level: building.level > 1 ? building.level : undefined,
        branch: building.branch,
      };
    }
    return entries;
  },
  {},
);

for (const wallBuilding of Object.values(WALL_SEGMENT_BUILDINGS)) {
  buildingEntries[wallBuilding.id] = {
    name: wallBuilding.name,
    vector: wallBuilding.vector ? getDevelopmentVectorKey(wallBuilding.vector) : getProgressionNodeVectorFromId(wallBuilding.id),
    level: wallBuilding.level,
    branch: wallBuilding.branch,
  };
}

export const PROGRESSION_REGISTRY: ProgressionRegistry = {
  research: Object.fromEntries(Object.values(researchTree).map(research => [
    research.id,
    {
      name: research.name,
      vector: getProgressionNodeVectorFromId(research.id),
      level: research.level,
      branch: research.branch,
    },
  ])),
  buildings: buildingEntries,
  towerParts: Object.fromEntries(TOWER_PARTS.map(part => [
    part.id,
    {
      name: part.name,
      vector: part.vector ?? getProgressionNodeVectorFromId(part.id),
      level: part.level,
      branch: part.branch,
    },
  ])),
  structures: Object.fromEntries(Object.values(WALL_SUPERSTRUCTURE_BUILDINGS).map(wallSuperstructure => [
    wallSuperstructure.id,
    {
      name: wallSuperstructure.name,
      vector: wallSuperstructure.vector
        ? getDevelopmentVectorKey(wallSuperstructure.vector)
        : getProgressionNodeVectorFromId(wallSuperstructure.id),
      level: wallSuperstructure.level,
      branch: wallSuperstructure.branch,
    },
  ])),
};

export const PROGRESSION_GRAPH = buildProgressionGraph(PROGRESSION_RULES, PROGRESSION_REGISTRY);

export const PROGRESSION_VALIDATION_ERRORS = [
  ...validateProgressionGraph(PROGRESSION_RULES, PROGRESSION_REGISTRY),
  ...researchGraphValidationErrors,
];

function getDevelopmentVectorKey(vector: DevelopmentVectorValue): DevelopmentVectorKey | undefined {
  return Object.entries(DEVELOPMENT_VECTORS)
    .find(([, value]) => value === vector)?.[0] as DevelopmentVectorKey | undefined;
}

