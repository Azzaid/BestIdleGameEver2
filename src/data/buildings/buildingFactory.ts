import type {Building} from "../../models/city/Building.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";

type BuildingOptions = {
    requirements?: Requirement[];
    buildRequirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
    visualAssetId?: string;
};

type SuperstructureOptions = BuildingOptions & {
  requiredBuildingIds?: string[];
  requiredBuildingSprites?: Record<string, string>;
  hint?: string;
};

type BuildingFactoryOptions = {
  vector: DevelopmentVectorValue;
  defaultKeywords: BuildingKeyword[];
};

export function createBuildingFactory({vector, defaultKeywords}: BuildingFactoryOptions) {
  function building(
    id: string,
    name: string,
    description: string,
    keywords: BuildingKeyword[] = [],
    options: BuildingOptions = {},
  ): Building {
    return {
      id,
      name,
      type: BUILDING_TYPES.produce,
      level: 1,
      isMultiHex: false,
      isMultistructure: false,
      vector,
      values: options.values,
      effects: options.effects,
      adjacencyDescription: "Not affected",
      description,
      visualAssetId: options.visualAssetId,
      keywords: [...defaultKeywords, ...keywords],
      requirements: options.requirements,
      buildRequirements: options.buildRequirements,
    };
  }

  function superstructure(
    id: string,
    name: string,
    description: string,
    keywords: BuildingKeyword[] = [],
    options: SuperstructureOptions = {},
  ): Building {
    return {
      ...building(id, name, description, keywords, options),
      isMultiHex: true,
      isMultistructure: true,
      multiHexStructure: options.requiredBuildingIds
        ? [{
            requiredBuildingIds: options.requiredBuildingIds,
            requiredBuildingSprites: options.requiredBuildingSprites,
            hint: options.hint,
        }]
        : undefined,
    };
  }

  return {
    building,
    superstructure,
  };
}
