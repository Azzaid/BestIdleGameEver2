import type {ResearchDB} from "../../models/research/researchDB.ts";

export const medievalResearch: ResearchDB = {
  root: {
    id: "root",
    parentId: null,
    name: "Curiosity",
    vector: "medieval",
    summary: "First you need to ask. What if? Then stuff starts exploding.",
  },
  medieval: {
    id: "medieval",
    parentId: "root",
    name: "Medieval",
    vector: "medieval",
    summary: "Steel, guilds, taxes.",
  },
  "guild-charter": {
    id: "guild-charter",
    parentId: "medieval",
    name: "Guild Charter",
    vector: "medieval",
    summary: "Trade & crafting bonuses.",
  },
  fortifications: {
    id: "fortifications",
    parentId: "medieval",
    name: "Fortifications",
    vector: "medieval",
    summary: "City walls & towers.",
  },
  "medieval-artillery": {
    id: "medieval-artillery",
    parentId: "fortifications",
    name: "Siege Artillery",
    vector: "medieval",
    summary: "Standardize crews, fittings, and rugged tower attachments.",
  },
  livingWood: {
    id: "livingWood",
    parentId: "fortifications",
    name: "Living Wood",
    vector: "medieval",
    summary: "City walls & towers.",
    alsoRequires: ["selection"],
  },
};
