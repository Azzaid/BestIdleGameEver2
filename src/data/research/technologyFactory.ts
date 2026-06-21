import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {requires} from "../requirements.ts";

type TechnologyFactoryOptions = {
  defaultKeywords?: string[];
};

type TechnologyOptions = {
  alsoRequires?: string[];
  keywords?: string[];
  requirements?: Requirement[];
  unlocks?: string[];
  requiredBuildings?: string[];
  requiredStructures?: string[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  requiredFreeUpkeep?: ResearchNodeData["requiredFreeUpkeep"];
  requiredAetherAtmosphere?: ResearchNodeData["requiredAetherAtmosphere"];
  requiredBiodiversity?: number;
  notes?: string;
};

export function createTechnologyFactory({defaultKeywords = []}: TechnologyFactoryOptions) {
  function technology(
    id: string,
    parentId: string | null,
    name: string,
    summary: string,
    options: TechnologyOptions = {},
  ): ResearchNodeData {
    const graphPrerequisites = [
      parentId,
      ...(options.alsoRequires ?? []),
    ].filter((technologyId): technologyId is string => Boolean(technologyId));
    const existingRequirements = options.requirements ?? [];
    const existingTechnologyRequirements = new Set(
      existingRequirements
        .filter(requirement => requirement.type === "technologyUnlocked")
        .map(requirement => requirement.technologyId),
    );

    return {
      id,
      parentId,
      name,
      keywords: [...defaultKeywords, ...(options.keywords ?? [])],
      summary,
      unlocks: options.unlocks,
      alsoRequires: options.alsoRequires,
      requirements: [
        ...graphPrerequisites
          .filter(technologyId => !existingTechnologyRequirements.has(technologyId))
          .map(technologyId => requires.technologyUnlocked(technologyId)),
        ...existingRequirements,
      ],
      values: options.values,
      effects: options.effects?.map(modifier => ({
        ...modifier,
        radius: Infinity,
      })),
      requiredBuildings: options.requiredBuildings,
      requiredStructures: options.requiredStructures,
      requiredFreeUpkeep: options.requiredFreeUpkeep,
      requiredAetherAtmosphere: options.requiredAetherAtmosphere,
      requiredBiodiversity: options.requiredBiodiversity,
      notes: options.notes,
    };
  }

  return {
    technology,
  };
}
