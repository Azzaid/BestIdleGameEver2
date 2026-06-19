import type {Building} from "../../models/city/Building.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {buildings} from "../identificators/index.ts";
import {createBuildingFactory} from "./buildingFactory.ts";

const {
  building: bioBuilding,
  superstructure: bioSuperstructure,
  structureRule,
  multiHexStructure,
} = createBuildingFactory({
  vector: DEVELOPMENT_VECTORS.nature,
  defaultKeywords: ["nature"],
});

export const natureBuildings: {[key: string]: Building} = {
  [buildings.nature.wildGarden]: {
    ...bioBuilding(
      buildings.nature.wildGarden,
      "Wild Garden",
      "A small garden with wild edible, medicinal, and strange plants.",
      8,
      {[UPKEEP_TYPES.plants]: 5},
      {[UPKEEP_TYPES.people]: 1},
      ["production", "plants", "garden", "herbs"],
    ),
    multiHexStructure: multiHexStructure(buildings.nature.wildGarden, [
      structureRule(buildings.nature.herbalistHut, [
        buildings.medieval.stalkerHut,
      ]),
    ]),
  },
  [buildings.nature.herbalistHut]: bioSuperstructure(
    buildings.nature.herbalistHut,
    "Herbalist Hut",
    "A stalker hut and wild garden combined into a place for cultivating and preparing gathered plants.",
    12,
    {[UPKEEP_TYPES.plants]: 7},
    {},
    ["production", "plants", "herbs"],
  ),
  [buildings.nature.field]: {
    ...bioBuilding(
      buildings.nature.field,
      "Field",
      "A planned growing field for deliberate plant cultivation.",
      14,
      {[UPKEEP_TYPES.plants]: 4},
      {[UPKEEP_TYPES.people]: 2},
      ["production", "plants", "farm"],
    ),
    homogeneousAdjacency: [
      {
        radius: 1,
        requiredBuildingKeywords: ["production"],
        requiredValueKeywords: ["output", "production"],
        multiplier: 1.25,
      },
    ],
    adjacencyDescription: "Neighboring producers gain 25% output.",
    multiHexStructure: multiHexStructure(buildings.nature.field, [
      structureRule(buildings.medieval.farm, [
        buildings.medieval.woodenHouse,
      ]),
    ]),
  },
};
