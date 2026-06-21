import type {Building} from "../../models/city/Building.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";
import {createBuildingFactory} from "./buildingFactory.ts";

const {
  building: bioBuilding,
  superstructure: bioSuperstructure,
} = createBuildingFactory({
  vector: DEVELOPMENT_VECTORS.nature,
  defaultKeywords: ["nature"],
});

const natureBuildingsRaw: {[key: string]: Building} = {
  [buildings.nature.wildGarden]: {
    ...bioBuilding(
      buildings.nature.wildGarden,
      "Wild Garden",
      "A small garden with wild edible, medicinal, and strange plants.",
      8,
      {[UPKEEP_TYPES.plants]: 5},
      {[UPKEEP_TYPES.people]: 1},
      ["production", "plants", "garden", "herbs"],
      {requirements: [
        requires.technologyUnlocked(technologies.nature.seedGathering),
      ]},
    ),
  },
  [buildings.nature.herbalistHut]: bioSuperstructure(
    buildings.nature.herbalistHut,
    "Herbalist Hut",
    "A stalker hut and wild garden combined into a place for cultivating and preparing gathered plants.",
    12,
    {[UPKEEP_TYPES.plants]: 7},
    {},
    ["production", "plants", "herbs"],
    {requiredBuildingIds: [
      buildings.nature.wildGarden,
      buildings.medieval.stalkerHut,
    ],
    requirements: [
      requires.buildingExists(buildings.nature.wildGarden),
      requires.buildingExists(buildings.medieval.stalkerHut),
    ]},
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
      {requirements: [
        requires.technologyUnlocked(technologies.nature.plantCultivation),
      ]},
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
  },
};

export const natureBuildings: {[key: string]: Building} = Object.fromEntries(
  Object.values(natureBuildingsRaw).map(building => [building.id, building]),
);
