import type {Building} from "../../models/city/Building.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import type {MultiHexStructureRule} from "../../models/city/MultiHexStructure.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES, type UpkeepAmount} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import {buildings} from "../identificators/index.ts";

function bioBuilding(
  id: string,
  name: string,
  description: string,
  trace: number,
  providedUpkeep: UpkeepAmount = {},
  requiredUpkeep: UpkeepAmount = {},
  keywords: BuildingKeyword[] = [],
): Building {
  return {
    id,
    name,
    type: BUILDING_TYPES.produce,
    level: 1,
    size: 1,
    isMultiHex: false,
    isMultistructure: false,
    vector: DEVELOPMENT_VECTORS.nature,
    requiredUpkeep,
    requiredUpkeepDescription: {},
    trace,
    providedUpkeep,
    providedUpkeepDescription: {},
    adjacency: [],
    adjacencyDescription: "Not affected",
    description,
    keywords: ["nature", ...keywords],
  };
}

function bioSuperstructure(
  id: string,
  name: string,
  description: string,
  size: number,
  providedUpkeep: UpkeepAmount = {},
  requiredUpkeep: UpkeepAmount = {},
  keywords: BuildingKeyword[] = [],
): Building {
  return {
    ...bioBuilding(id, name, description, 0, providedUpkeep, requiredUpkeep, keywords),
    size,
    isMultiHex: true,
    isMultistructure: true,
  };
}

function structureRule(
  resultingBuildingId: string,
  requiredBuildingIds: string[],
): MultiHexStructureRule {
  return {
    requiredBuildingIds,
    resultingBuildingId,
    replacementMap: Object.fromEntries(requiredBuildingIds.map(id => [id, resultingBuildingId])),
    developerVector: DEVELOPMENT_VECTORS.nature,
  };
}

export const natureBuildings: {[key: string]: Building} = {
  [buildings.nature.wildGarden]: {
    ...bioBuilding(
      buildings.nature.wildGarden,
      "Wild Garden",
      "A small garden with wild edible, medicinal, and strange plants.",
      8,
      {[UPKEEP_TYPES.biomass]: 5},
      {[UPKEEP_TYPES.people]: 1},
      ["production", "biomass", "garden", "herbs"],
    ),
    multiHexStructure: [
      structureRule(buildings.nature.herbalistHut, [
        buildings.medieval.stalkerHut,
        buildings.nature.wildGarden,
      ]),
    ],
  },
  [buildings.nature.herbalistHut]: bioSuperstructure(
    buildings.nature.herbalistHut,
    "Herbalist Hut",
    "A stalker hut and wild garden combined into a place for cultivating and preparing gathered plants.",
    2,
    {[UPKEEP_TYPES.biomass]: 7},
    {},
    ["production", "biomass", "herbs"],
  ),
  [buildings.nature.field]: {
    ...bioBuilding(
      buildings.nature.field,
      "Field",
      "A planned growing field for deliberate plant cultivation.",
      14,
      {[UPKEEP_TYPES.biomass]: 4},
      {[UPKEEP_TYPES.people]: 2},
      ["production", "biomass", "farm"],
    ),
    adjacency: [
      {
        scope: "neighbors",
        radiusInHexes: 1,
        targetFilter: {keywords: ["people", "biomass"]},
        effect: {providedUpkeepMul: {[UPKEEP_TYPES.people]: 1.25, [UPKEEP_TYPES.biomass]: 1.25}},
      },
    ],
    adjacencyDescription: "Neighboring People and Biomass producers gain 25% output.",
    multiHexStructure: [
      structureRule(buildings.medieval.farm, [
        buildings.nature.field,
        buildings.medieval.woodenHouse,
      ]),
    ],
  },
};
