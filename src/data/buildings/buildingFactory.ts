import type {Building} from "../../models/city/Building.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import type {UpkeepAmount} from "../../models/Upkeep.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import {
  citySignatureToHomogeneousValueEffect,
  upkeepAmountToHomogeneousValueEffects,
} from "../../models/homogeneousValueAdapters.ts";

type BuildingOptions = {
    requirements?: Requirement[];
    values?: HomogeneousValueEffect[];
    effects?: HomogeneousAdjacencyRule[];
};

type SuperstructureOptions = BuildingOptions & {
  requiredBuildingIds?: string[];
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
    signature: number,
    providedUpkeep: UpkeepAmount = {},
    requiredUpkeep: UpkeepAmount = {},
    keywords: BuildingKeyword[] = [],
    options: BuildingOptions = {},
  ): Building {
    const values = [
      ...upkeepAmountToHomogeneousValueEffects(providedUpkeep, "production"),
      ...upkeepAmountToHomogeneousValueEffects(requiredUpkeep, "upkeep"),
      ...citySignatureToHomogeneousValueEffect(signature),
      ...(options.values ?? []),
    ];

    return {
      id,
      name,
      type: BUILDING_TYPES.produce,
      level: 1,
      isMultiHex: false,
      isMultistructure: false,
      vector,
      values,
      effects: options.effects,
      adjacencyDescription: "Not affected",
      description,
      keywords: [...defaultKeywords, ...keywords],
      requirements: options.requirements,
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
    options: SuperstructureOptions = {},
  ): Building {
    return {
      ...building(id, name, description, signature, providedUpkeep, requiredUpkeep, keywords, options),
      isMultiHex: true,
      isMultistructure: true,
      multiHexStructure: options.requiredBuildingIds
        ? [{requiredBuildingIds: options.requiredBuildingIds, hint: options.hint}]
        : undefined,
    };
  }

  return {
    building,
    superstructure,
  };
}
