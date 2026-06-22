import {BUILDINGS_ATLAS} from "../../../data/buildings/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../../data/wallSegments/index.ts";
import {WALL_TOWER_BUILDINGS} from "../../../data/wallSuperstructures/index.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import {researchGraphValidationErrors, researchTree} from "../../../data/research/index.ts";
import {TOWER_PARTS} from "../../../data/gunParts/index.ts";
import {buildProgressionGraph, validateProgressionGraph} from "./progression.ts";
import {PROGRESSION_RULES} from "./rules.ts";
import type {ProgressionRegistry, ProgressionRegistryEntry} from "./types.ts";
import type {DevelopmentVectorKey, DevelopmentVectorValue} from "../../../models/DevlopmentVector.ts";

const buildingEntries = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, ProgressionRegistryEntry>>(
  (entries, vector) => {
    for (const building of Object.values(BUILDINGS_ATLAS[vector])) {
      entries[building.id] = {
        name: building.name,
        vector: getDevelopmentVectorKey(building.vector),
      };
    }
    return entries;
  },
  {},
);

for (const wallBuilding of [
  ...Object.values(WALL_SEGMENT_BUILDINGS),
  ...Object.values(WALL_TOWER_BUILDINGS),
]) {
  buildingEntries[wallBuilding.id] = {
    name: wallBuilding.name,
  };
}

export const PROGRESSION_REGISTRY: ProgressionRegistry = {
  research: Object.fromEntries(Object.values(researchTree).map(research => [
    research.id,
    {name: research.name, vector: research.vector},
  ])),
  buildings: buildingEntries,
  towerParts: Object.fromEntries(TOWER_PARTS.map(part => [
    part.id,
    {name: part.name, vector: part.vector},
  ])),
  structures: {},
};

export const PROGRESSION_GRAPH = buildProgressionGraph(PROGRESSION_RULES, PROGRESSION_REGISTRY);

export const PROGRESSION_VALIDATION_ERRORS = [
  ...validateProgressionGraph(PROGRESSION_RULES, PROGRESSION_REGISTRY),
  ...researchGraphValidationErrors,
];

function getDevelopmentVectorKey(vector: DevelopmentVectorValue): DevelopmentVectorKey {
  const entry = Object.entries(DEVELOPMENT_VECTORS).find(([, value]) => value === vector);
  return entry?.[0] as DevelopmentVectorKey;
}
