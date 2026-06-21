import type {Building} from "../../models/city/Building.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {DevelopmentVectorValue} from "../../models/DevlopmentVector.ts";
import type {UpkeepAmount} from "../../models/Upkeep.ts";
import {
  citySignatureToHomogeneousValueEffect,
  upkeepAmountToHomogeneousValueEffects,
} from "../../models/homogeneousValueAdapters.ts";

type SuperstructureOptions = {
  requiredBuildingIds?: string[];
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
    options: SuperstructureOptions = {},
  ): Building {
    return {
      ...building(id, name, description, signature, providedUpkeep, requiredUpkeep, keywords),
      isMultiHex: true,
      isMultistructure: true,
      multiHexStructure: options.requiredBuildingIds
        ? [{requiredBuildingIds: options.requiredBuildingIds}]
        : undefined,
    };
  }

  return {
    building,
    superstructure,
  };
}
