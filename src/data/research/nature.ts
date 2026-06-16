import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const natureResearch: ResearchDB = {
  [technologies.nature.branch]: {
    id: technologies.nature.branch,
    parentId: technologies.medieval.root,
    name: "Nature Branch",
    vector: "nature",
    summary: "Growth & food.",
  },
  [technologies.nature.seedCult]: {
    id: technologies.nature.seedCult,
    parentId: technologies.nature.branch,
    name: "Seed Cultivation",
    vector: "nature",
    summary: "Unlock farms.",
  },
  [technologies.nature.selection]: {
    id: technologies.nature.selection,
    parentId: technologies.nature.seedCult,
    name: "Selection",
    vector: "nature",
    summary: "Unlock bio research",
  },
  [technologies.nature.weaponcraft]: {
    id: technologies.nature.weaponcraft,
    parentId: technologies.nature.selection,
    name: "Living Weaponcraft",
    vector: "nature",
    summary: "Shape roots, spores, and sinew into tower components.",
  },
  [technologies.nature.herbalLore]: {
    id: technologies.nature.herbalLore,
    parentId: technologies.nature.branch,
    name: "Herbal Lore",
    vector: "nature",
    summary: "Simple elixirs.",
  },
};
