import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {ResearchAtlas, ResearchDB} from "../../models/research/researchDB.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {BUILDINGS_ATLAS} from "../buildings/index.ts";
import {PROGRESSION_RULES} from "../content/rules.ts";
import {getProgressionUnlockLabels, getRuleForTarget} from "../content/progression.ts";
import {STRUCTURES} from "../structures/index.ts";
import {TOWER_PART_DEFINITIONS} from "../towers/parts/index.ts";
import {validateResearchGraph} from "../../models/research/researchGraph.ts";
import {aetherResearch} from "./aether.ts";
import {medievalResearch} from "./medieval.ts";
import {natureResearch} from "./nature.ts";
import {techResearch} from "./tech.ts";

const researchDefinitions: ResearchDB = {
  ...techResearch,
  ...natureResearch,
  ...medievalResearch,
  ...aetherResearch,
};

const buildingNames = Object.values(DEVELOPMENT_VECTORS).reduce<Record<string, string>>(
  (names, vector) => {
    for (const building of Object.values(BUILDINGS_ATLAS[vector])) {
      names[building.id] = building.name;
    }
    return names;
  },
  {},
);

const progressionRegistry = {
  research: Object.fromEntries(
    Object.values(researchDefinitions).map(research => [research.id, research.name]),
  ),
  buildings: buildingNames,
  towerParts: Object.fromEntries(TOWER_PART_DEFINITIONS.map(part => [part.id, part.name])),
  structures: Object.fromEntries(STRUCTURES.map(structure => [structure.id, structure.name])),
};

export const researchTree: ResearchDB = Object.fromEntries(
  Object.values(researchDefinitions).map(research => {
    const rule = getRuleForTarget(PROGRESSION_RULES, "research", research.id);
    const requiredBuildings = rule?.requires?.buildings;
    const requiredStructures = rule?.requires?.structures;
    const requiredFreeUpkeep = rule?.requires?.freeUpkeep;
    const unlockLabels = getProgressionUnlockLabels(PROGRESSION_RULES, progressionRegistry, research.id);

    return [
      research.id,
      {
        ...research,
        ...(requiredBuildings?.length ? {requiredBuildings} : {}),
        ...(requiredStructures?.length ? {requiredStructures} : {}),
        ...(requiredFreeUpkeep ? {requiredFreeUpkeep} : {}),
        ...(unlockLabels.length ? {unlocks: unlockLabels} : {}),
      } satisfies ResearchNodeData,
    ];
  }),
);

const requiredResearchById = Object.fromEntries(
  Object.values(researchTree).map(research => {
    const rule = getRuleForTarget(PROGRESSION_RULES, "research", research.id);
    return [research.id, rule?.requires?.research ?? []];
  }),
);

export const researchGraphValidationErrors = validateResearchGraph(researchTree, requiredResearchById);

const createEmptyResearchAtlas = (): ResearchAtlas => ({
  tech: {},
  nature: {},
  medieval: {},
  aether: {},
});

export const RESEARCH_ATLAS = Object.values(researchTree).reduce<ResearchAtlas>((atlas, node) => {
  atlas[node.vector][node.id] = node;
  return atlas;
}, createEmptyResearchAtlas());
