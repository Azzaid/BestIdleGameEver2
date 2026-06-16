import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const medievalResearch: ResearchDB = {
  [technologies.medieval.root]: {
    id: technologies.medieval.root,
    parentId: null,
    name: "Curiosity",
    vector: "medieval",
    summary: "First you need to ask. What if? Then stuff starts exploding.",
  },
  [technologies.medieval.branch]: {
    id: technologies.medieval.branch,
    parentId: technologies.medieval.root,
    name: "Medieval",
    vector: "medieval",
    summary: "Steel, guilds, taxes.",
  },
  [technologies.medieval.guildCharter]: {
    id: technologies.medieval.guildCharter,
    parentId: technologies.medieval.branch,
    name: "Guild Charter",
    vector: "medieval",
    summary: "Trade & crafting bonuses.",
  },
  [technologies.medieval.fortifications]: {
    id: technologies.medieval.fortifications,
    parentId: technologies.medieval.branch,
    name: "Fortifications",
    vector: "medieval",
    summary: "City walls & towers.",
  },
  [technologies.medieval.artillery]: {
    id: technologies.medieval.artillery,
    parentId: technologies.medieval.fortifications,
    name: "Siege Artillery",
    vector: "medieval",
    summary: "Standardize crews, fittings, and rugged tower attachments.",
  },
  [technologies.medieval.livingWood]: {
    id: technologies.medieval.livingWood,
    parentId: technologies.medieval.fortifications,
    name: "Living Wood",
    vector: "medieval",
    summary: "City walls & towers.",
    alsoRequires: ["selection"],
  },
};
