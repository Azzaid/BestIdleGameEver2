import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const natureResearch: ResearchDB = {
  [technologies.nature.branch]: {
    id: technologies.nature.branch,
    parentId: technologies.medieval.root,
    name: "Green Work",
    vector: "nature",
    summary: "Seeds, fields, plant lore, and biological pressure turned into a city system.",
  },
  [technologies.nature.seedGathering]: {
    id: technologies.nature.seedGathering,
    parentId: technologies.medieval.foraging,
    name: "Seed Gathering",
    vector: "nature",
    summary: "Use the stalker house routes to collect and preserve useful wild seeds.",
  },
  [technologies.nature.seedCult]: {
    id: technologies.nature.seedCult,
    parentId: technologies.nature.seedGathering,
    name: "Seed Cultivation",
    vector: "nature",
    summary: "Turn wild seeds into repeatable cultivation.",
  },
  [technologies.nature.selection]: {
    id: technologies.nature.selection,
    parentId: technologies.nature.seedCult,
    name: "Selection",
    vector: "nature",
    summary: "Unlock bio research by choosing useful traits over merely surviving plants.",
  },
  [technologies.nature.botany]: {
    id: technologies.nature.botany,
    parentId: technologies.nature.seedGathering,
    name: "Botany",
    vector: "nature",
    summary: "Turn herbalist practice into field planning, poison handling, and deliberate plant use.",
  },
  [technologies.nature.weaponcraft]: {
    id: technologies.nature.weaponcraft,
    parentId: technologies.nature.botany,
    name: "Living Weaponcraft",
    vector: "nature",
    summary: "Shape roots, spores, poisoned stones, and sensing organs into tower components.",
    alsoRequires: [technologies.nature.selection],
  },
  [technologies.nature.herbalLore]: {
    id: technologies.nature.herbalLore,
    parentId: technologies.nature.botany,
    name: "Herbal Lore",
    vector: "nature",
    summary: "Simple elixirs and enough caution to stop eating the loud leaves.",
  },
};
