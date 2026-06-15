import {BUILDINGS_ATLAS} from "../buildings/index.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {researchGraphValidationErrors, researchTree} from "../research/index.ts";
import {STRUCTURES} from "../structures/index.ts";
import {TOWER_PARTS} from "../towers/index.ts";
import {buildProgressionGraph, validateProgressionGraph} from "./progression.ts";
import {PROGRESSION_RULES} from "./rules.ts";
import type {ProgressionRegistry} from "./types.ts";

const buildingNames = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, string>>(
  (names, vector) => {
    for (const building of Object.values(BUILDINGS_ATLAS[vector])) {
      names[building.id] = building.name;
    }
    return names;
  },
  {},
);

export const PROGRESSION_REGISTRY: ProgressionRegistry = {
  research: Object.fromEntries(Object.values(researchTree).map(research => [research.id, research.name])),
  buildings: buildingNames,
  towerParts: Object.fromEntries(TOWER_PARTS.map(part => [part.id, part.name])),
  structures: Object.fromEntries(STRUCTURES.map(structure => [structure.id, structure.name])),
};

export const PROGRESSION_GRAPH = buildProgressionGraph(PROGRESSION_RULES, PROGRESSION_REGISTRY);

export const PROGRESSION_VALIDATION_ERRORS = [
  ...validateProgressionGraph(PROGRESSION_RULES, PROGRESSION_REGISTRY),
  ...researchGraphValidationErrors,
];
