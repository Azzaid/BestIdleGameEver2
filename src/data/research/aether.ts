import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const aetherResearch: ResearchDB = {
  [technologies.aether.branch]: {
    id: technologies.aether.branch,
    parentId: technologies.medieval.root,
    name: "Aether Core",
    vector: "aether",
    summary: "Unlock the flow of arcane energy.",
  },
  [technologies.aether.leylineTapping]: {
    id: technologies.aether.leylineTapping,
    parentId: technologies.aether.branch,
    name: "Leyline Tapping",
    vector: "aether",
    summary: "Draw stable mana into city infrastructure.",
  },
  [technologies.aether.runeSupplies]: {
    id: technologies.aether.runeSupplies,
    parentId: technologies.aether.leylineTapping,
    name: "Rune Supplies",
    vector: "aether",
    summary: "Prepare charged materials for repeatable arcane engineering.",
  },
  [technologies.aether.artillery]: {
    id: technologies.aether.artillery,
    parentId: technologies.aether.runeSupplies,
    name: "Aether Artillery",
    vector: "aether",
    summary: "Bind omen, focus, and phase effects into tower components.",
  },
};
