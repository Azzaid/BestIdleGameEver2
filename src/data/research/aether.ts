import type {ResearchDB} from "../../models/research/researchDB.ts";

export const aetherResearch: ResearchDB = {
  aether: {
    id: "aether",
    parentId: "root",
    name: "Aether Core",
    vector: "aether",
    summary: "Unlock the flow of arcane energy.",
  },
  "leyline-tapping": {
    id: "leyline-tapping",
    parentId: "aether",
    name: "Leyline Tapping",
    vector: "aether",
    summary: "Draw stable mana into city infrastructure.",
  },
  "rune-supplies": {
    id: "rune-supplies",
    parentId: "leyline-tapping",
    name: "Rune Supplies",
    vector: "aether",
    summary: "Prepare charged materials for repeatable arcane engineering.",
  },
  "aether-artillery": {
    id: "aether-artillery",
    parentId: "rune-supplies",
    name: "Aether Artillery",
    vector: "aether",
    summary: "Bind omen, focus, and phase effects into tower components.",
  },
};
