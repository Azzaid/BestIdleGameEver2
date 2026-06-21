import {getResearchNodeVector, type ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {ResearchAtlas, ResearchDB} from "../../models/research/researchDB.ts";
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

export const researchTree: ResearchDB = Object.fromEntries(
  Object.values(researchDefinitions).map(research => {
    return [
      research.id,
      research satisfies ResearchNodeData,
    ];
  }),
);

const requiredResearchById = Object.fromEntries(
  Object.values(researchTree).map(research => {
    return [
      research.id,
      (research.requirements ?? [])
        .filter(requirement => requirement.type === "technologyUnlocked")
        .map(requirement => requirement.technologyId),
    ];
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
  atlas[getResearchNodeVector(node)][node.id] = node;
  return atlas;
}, createEmptyResearchAtlas());
