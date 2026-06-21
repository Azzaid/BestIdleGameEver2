import type {ResearchDB} from "../../models/research/researchDB.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";
import {createTechnologyFactory} from "./technologyFactory.ts";

const {technology} = createTechnologyFactory({
  defaultKeywords: ["nature"],
});

export const natureResearch: ResearchDB = {
  [technologies.nature.seedGathering]: technology(
    technologies.nature.seedGathering,
    technologies.medieval.foraging,
    "Seed Gathering",
    "Stalker hut routes begin preserving useful wild seeds for the future bio branch.",
    {
      requirements: [
        requires.buildingExists(buildings.medieval.stalkerHut),
      ],
    },
  ),
  [technologies.nature.plantCultivation]: technology(
    technologies.nature.plantCultivation,
    technologies.nature.seedGathering,
    "Plant Cultivation",
    "The settlement learns to deliberately grow and use useful plants.",
    {
      requirements: [
        requires.buildingExists(buildings.nature.herbalistHut),
      ],
    },
  ),
};
