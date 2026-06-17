import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const natureResearch: ResearchDB = {
  [technologies.nature.seedGathering]: {
    id: technologies.nature.seedGathering,
    parentId: technologies.medieval.foraging,
    name: "Seed Gathering",
    vector: "nature",
    summary: "Stalker hut routes begin preserving useful wild seeds for the future bio branch.",
  },
  [technologies.nature.plantCultivation]: {
    id: technologies.nature.plantCultivation,
    parentId: technologies.nature.seedGathering,
    name: "Plant Cultivation",
    vector: "nature",
    summary: "The settlement learns to deliberately grow and use useful plants.",
  },
};
