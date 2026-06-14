import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {ResearchAtlas, ResearchDB} from "../../models/research/researchDB.ts";
import {BUILDINGS_ATLAS} from "../buildings/index.ts";
import {PROGRESSION_RULES} from "../content/rules.ts";
import {getProgressionUnlockLabels, getRuleForTarget} from "../content/progression.ts";
import {STRUCTURES} from "../structures/index.ts";
import {TOWER_PART_DEFINITIONS} from "../towers/parts.ts";

const researchDefinitions: ResearchDB = {
  root: {
    id: "root",
    parentId: null,
    name: "Curiosity",
    vector: "medieval",
    summary: "First you need to ask. What if? Then stuff starts exploding.",
  },
  aether: {
    id: "aether",
    parentId: "root",
    name: "Aether Core",
    vector: "aether",
    summary: "Unlock the flow of arcane energy.",
  },
  tech: {
    id: "tech",
    parentId: "root",
    name: "Tech Branch",
    vector: "tech",
    summary: "Start of technology.",
  },
  "copper-tools": {
    id: "copper-tools",
    parentId: "tech",
    name: "Copper Tools",
    vector: "tech",
    summary: "Basic tools.",
  },
  "basic-circuits": {
    id: "basic-circuits",
    parentId: "tech",
    name: "Basic Circuits",
    vector: "tech",
    summary: "Tiny brains.",
  },
  "precision-fabrication": {
    id: "precision-fabrication",
    parentId: "basic-circuits",
    name: "Precision Fabrication",
    vector: "tech",
    summary: "Unlock high-tech component production and refined machine parts.",
  },
  "automation-i": {
    id: "automation-i",
    parentId: "tech",
    name: "Automation I",
    vector: "tech",
    summary: "First tier automation.",
    alsoRequires: ["copper-tools", "basic-circuits"],
  },

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

const buildingNames = Object.values(BUILDINGS_ATLAS).reduce<Record<string, string>>(
  (names, buildingsById) => {
    for (const building of Object.values(buildingsById)) {
      names[building.id] = building.name;
    }
    return names;
  },
  {},
);

const progressionRegistry = {
  research: Object.fromEntries(
    Object.values(researchDefinitions).map(research => [research.id, research.name]),
  ),
  buildings: buildingNames,
  towerParts: Object.fromEntries(TOWER_PART_DEFINITIONS.map(part => [part.id, part.name])),
  structures: Object.fromEntries(STRUCTURES.map(structure => [structure.id, structure.name])),
};

export const researchThree: ResearchDB = Object.fromEntries(
  Object.values(researchDefinitions).map(research => {
    const rule = getRuleForTarget(PROGRESSION_RULES, "research", research.id);
    const requiredBuildings = rule?.requires?.buildings;
    const requiredStructures = rule?.requires?.structures;
    const requiredFreeUpkeep = rule?.requires?.freeUpkeep;
    const unlockLabels = getProgressionUnlockLabels(PROGRESSION_RULES, progressionRegistry, research.id);

    return [
      research.id,
      {
        ...research,
        ...(requiredBuildings?.length ? {requiredBuildings} : {}),
        ...(requiredStructures?.length ? {requiredStructures} : {}),
        ...(requiredFreeUpkeep ? {requiredFreeUpkeep} : {}),
        ...(unlockLabels.length ? {unlocks: unlockLabels} : {}),
      } satisfies ResearchNodeData,
    ];
  }),
);

const createEmptyResearchAtlas = (): ResearchAtlas => ({
  tech: {},
  nature: {},
  medieval: {},
  aether: {},
});

export const RESEARCH_ATLAS = Object.values(researchThree).reduce<ResearchAtlas>((atlas, node) => {
  atlas[node.vector][node.id] = node;
  return atlas;
}, createEmptyResearchAtlas());
