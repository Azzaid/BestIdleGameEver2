import type {ResearchDB} from "../../models/research/researchDB.ts";

export const natureResearch: ResearchDB = {
  nature: {
    id: "nature",
    parentId: "root",
    name: "Nature Branch",
    vector: "nature",
    summary: "Growth & food.",
  },
  "seed-cult": {
    id: "seed-cult",
    parentId: "nature",
    name: "Seed Cultivation",
    vector: "nature",
    summary: "Unlock farms.",
  },
  selection: {
    id: "selection",
    parentId: "seed-cult",
    name: "Selection",
    vector: "nature",
    summary: "Unlock bio research",
  },
  "nature-weaponcraft": {
    id: "nature-weaponcraft",
    parentId: "selection",
    name: "Living Weaponcraft",
    vector: "nature",
    summary: "Shape roots, spores, and sinew into tower components.",
  },
  "herbal-lore": {
    id: "herbal-lore",
    parentId: "nature",
    name: "Herbal Lore",
    vector: "nature",
    summary: "Simple elixirs.",
  },
};
