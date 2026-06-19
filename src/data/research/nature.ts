import type {ResearchDB} from "../../models/research/researchDB.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";

export const natureResearch: ResearchDB = {
  [technologies.nature.seedGathering]: {
    id: technologies.nature.seedGathering,
    parentId: technologies.medieval.foraging,
    name: "Seed Gathering",
    vector: "nature",
    summary: "Stalker hut routes begin preserving useful wild seeds for the future bio branch.",
    requirements: [
      requires.technologyUnlocked(technologies.medieval.foraging),
      requires.buildingExists(buildings.medieval.stalkerHut),
    ],
  },
  [technologies.nature.plantCultivation]: {
    id: technologies.nature.plantCultivation,
    parentId: technologies.nature.seedGathering,
    name: "Plant Cultivation",
    vector: "nature",
    summary: "The settlement learns to deliberately grow and use useful plants.",
    requirements: [
      requires.technologyUnlocked(technologies.nature.seedGathering),
      requires.buildingExists(buildings.nature.herbalistHut),
    ],
  },
};
