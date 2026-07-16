import {getResearchNodeVector, type ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {ResearchAtlas, ResearchDB} from "../../models/research/researchDB.ts";
import {validateResearchGraph} from "../../models/research/researchGraph.ts";
import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {createTechnologyFactory} from "./technologyFactory.ts";
import aetherResearchDefinitions from "./aether.json";
import medievalResearchDefinitions from "./medieval.json";
import natureResearchDefinitions from "./nature.json";
import neutralResearchDefinitions from "./neutral.json";
import techResearchDefinitions from "./tech.json";

type ResearchDefinition = {
  id: string;
  parentId: string | null;
  name: string;
  level?: number;
  branch?: string;
  summary?: string;
  keywords?: string[];
  alsoRequires?: string[];
  unlocks?: string[];
  requirements?: Requirement[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  requiredBuildings?: string[];
  requiredStructures?: string[];
  requiredFreeUpkeep?: ResearchNodeData["requiredFreeUpkeep"];
  requiredAetherAtmosphere?: ResearchNodeData["requiredAetherAtmosphere"];
  requiredBiodiversity?: number;
  notes?: string;
};

const definitionsByVector: Record<DevelopmentVectorKey, readonly ResearchDefinition[]> = {
  neutral: neutralResearchDefinitions as readonly ResearchDefinition[],
  tech: techResearchDefinitions as readonly ResearchDefinition[],
  nature: natureResearchDefinitions as readonly ResearchDefinition[],
  medieval: medievalResearchDefinitions as readonly ResearchDefinition[],
  aether: aetherResearchDefinitions as readonly ResearchDefinition[],
};

const researchDefinitions: ResearchDB = Object.assign(
  {},
  ...(Object.keys(definitionsByVector) as DevelopmentVectorKey[]).map(buildResearch),
);

export const researchTree: ResearchDB = Object.fromEntries(
  Object.values(researchDefinitions).map(research => [
    research.id,
    research satisfies ResearchNodeData,
  ]),
);

const requiredResearchById = Object.fromEntries(
  Object.values(researchTree).map(research => [
    research.id,
    (research.requirements ?? [])
      .filter(requirement => requirement.type === "technologyUnlocked")
      .map(requirement => requirement.technologyId),
  ]),
);

export const researchGraphValidationErrors = validateResearchGraph(researchTree, requiredResearchById);

const createEmptyResearchAtlas = (): ResearchAtlas => ({
  neutral: {},
  tech: {},
  nature: {},
  medieval: {},
  aether: {},
});

export const RESEARCH_ATLAS = Object.values(researchTree).reduce<ResearchAtlas>((atlas, node) => {
  atlas[getResearchNodeVector(node)][node.id] = node;
  return atlas;
}, createEmptyResearchAtlas());

function buildResearch(vector: DevelopmentVectorKey): ResearchDB {
  const {technology} = createTechnologyFactory({
    defaultKeywords: [vector],
  });

  return Object.fromEntries(
    definitionsByVector[vector].map(definition => [
      definition.id,
      technology(definition.id, definition.parentId, definition.name, definition.summary ?? "", definition),
    ]),
  );
}
