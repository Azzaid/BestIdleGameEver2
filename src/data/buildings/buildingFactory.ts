import type {Building} from "../../models/city/Building.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {MultiHexStructureRule} from "../../models/city/MultiHexStructure.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {UpkeepAmount} from "../../models/Upkeep.ts";
import {
  citySignatureToHomogeneousValueEffect,
  upkeepAmountToHomogeneousValueEffects,
} from "../../models/homogeneousValueAdapters.ts";

export type StructureRuleDraft = {
  resultingBuildingId: string;
  additionalRequiredBuildingIds: string[];
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
    signature: number,
    providedUpkeep: UpkeepAmount = {},
    requiredUpkeep: UpkeepAmount = {},
    keywords: BuildingKeyword[] = [],
  ): Building {
    return {
      id,
      name,
      type: BUILDING_TYPES.produce,
      level: 1,
      isMultiHex: false,
      isMultistructure: false,
      vector,
      homogeneousValueEffects: [
        ...upkeepAmountToHomogeneousValueEffects(providedUpkeep, "production"),
        ...upkeepAmountToHomogeneousValueEffects(requiredUpkeep, "upkeep"),
        ...citySignatureToHomogeneousValueEffect(signature),
      ],
      adjacency: [],
      adjacencyDescription: "Not affected",
      description,
      keywords: [...defaultKeywords, ...keywords],
    };
  }

  function superstructure(
    id: string,
    name: string,
    description: string,
    signature: number,
    providedUpkeep: UpkeepAmount = {},
    requiredUpkeep: UpkeepAmount = {},
    keywords: BuildingKeyword[] = [],
  ): Building {
    return {
      ...building(id, name, description, signature, providedUpkeep, requiredUpkeep, keywords),
      isMultiHex: true,
      isMultistructure: true,
    };
  }

  function structureRule(
    resultingBuildingId: string,
    additionalRequiredBuildingIds: string[],
  ): StructureRuleDraft {
    return {
      additionalRequiredBuildingIds,
      resultingBuildingId,
    };
  }

  function multiHexStructure(
    sourceBuildingId: string,
    rules: StructureRuleDraft[],
  ): MultiHexStructureRule[] {
    return rules.map(({additionalRequiredBuildingIds, resultingBuildingId}) => {
      const requiredBuildingIds = [sourceBuildingId, ...additionalRequiredBuildingIds];

      return {
        requiredBuildingIds,
        resultingBuildingId,
        replacementMap: Object.fromEntries(requiredBuildingIds.map(id => [id, resultingBuildingId])),
        developerVector: vector,
      };
    });
  }

  return {
    building,
    superstructure,
    structureRule,
    multiHexStructure,
  };
}
