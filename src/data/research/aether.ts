import type {ResearchDB} from "../../models/research/researchDB.ts";
import {technologies} from "../identificators/index.ts";

export const aetherResearch: ResearchDB = {
  [technologies.aether.branch]: {
    id: technologies.aether.branch,
    parentId: technologies.medieval.root,
    name: "Aether Practice",
    vector: "aether",
    summary: "Early ritual practice, omen work, mana handling, and eventually reliable arcane tower parts.",
  },
  [technologies.aether.mysticism]: {
    id: technologies.aether.mysticism,
    parentId: technologies.medieval.money,
    name: "Mysticism",
    vector: "aether",
    summary: "Market gossip, fortune telling, and the first civic permission to take omens seriously.",
  },
  [technologies.aether.magicStones]: {
    id: technologies.aether.magicStones,
    parentId: technologies.aether.mysticism,
    name: "Magic Stones",
    vector: "aether",
    summary: "Shamanic stone practice becomes stable enough to lift a tower platform.",
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
