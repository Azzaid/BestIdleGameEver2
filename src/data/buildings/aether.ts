import type {Building} from "../../models/city/Building.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import type {MultiHexStructureRule} from "../../models/city/MultiHexStructure.ts";
import {UPKEEP_TYPES, type UpkeepAmount} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import {buildings} from "../identificators/index.ts";
import {
  cityVisibilityToHomogeneousValueEffect,
  upkeepAmountToHomogeneousValueEffects,
} from "../../models/homogeneousValueAdapters.ts";

function magicBuilding(
  id: string,
  name: string,
  description: string,
  trace: number,
  providedUpkeep: UpkeepAmount = {},
  requiredUpkeep: UpkeepAmount = {},
  keywords: BuildingKeyword[] = [],
): Building {
  return {
    id,
    name,
    type: BUILDING_TYPES.produce,
    level: 1,
    size: 1,
    isMultiHex: false,
    isMultistructure: false,
    vector: DEVELOPMENT_VECTORS.aether,
    homogeneousValueEffects: [
      ...upkeepAmountToHomogeneousValueEffects(providedUpkeep, "production"),
      ...upkeepAmountToHomogeneousValueEffects(requiredUpkeep, "upkeep"),
      ...cityVisibilityToHomogeneousValueEffect(trace),
    ],
    adjacency: [],
    adjacencyDescription: "Not affected",
    description,
    keywords: ["aether", ...keywords],
  };
}

function magicSuperstructure(
  id: string,
  name: string,
  description: string,
  size: number,
  providedUpkeep: UpkeepAmount = {},
  requiredUpkeep: UpkeepAmount = {},
  keywords: BuildingKeyword[] = [],
): Building {
  return {
    ...magicBuilding(id, name, description, 0, providedUpkeep, requiredUpkeep, keywords),
    size,
    isMultiHex: true,
    isMultistructure: true,
  };
}

function structureRule(
  resultingBuildingId: string,
  requiredBuildingIds: string[],
): MultiHexStructureRule {
  return {
    requiredBuildingIds,
    resultingBuildingId,
    replacementMap: Object.fromEntries(requiredBuildingIds.map(id => [id, resultingBuildingId])),
    developerVector: DEVELOPMENT_VECTORS.aether,
  };
}

export const aetherBuildings: {[key: string]: Building} = {
  [buildings.aether.dolmen]: {
    ...magicBuilding(
      buildings.aether.dolmen,
      "Dolmen",
      "A raised stone place where early mysticism becomes a city practice.",
      20,
      {[UPKEEP_TYPES.veil]: 8},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 2},
      ["ritual"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.shamanHut, [
        buildings.aether.dolmen,
        buildings.medieval.stalkerHut,
      ]),
      structureRule(buildings.aether.runedHouse, [
        buildings.aether.wardedHome,
        buildings.aether.dolmen,
      ]),
    ],
  },
  [buildings.aether.shamanHut]: magicSuperstructure(
    buildings.aether.shamanHut,
    "Shaman Hut",
    "A dolmen and stalker hut combined into an early magical specialist dwelling.",
    2,
    {[UPKEEP_TYPES.veil]: 18, [UPKEEP_TYPES.manaFlows]: 10},
    {},
    ["production", "manaFlows", "ritual"],
  ),
  [buildings.aether.wardedHome]: {
    ...magicBuilding(
      buildings.aether.wardedHome,
      "Warded Home",
      "A dwelling protected by charms, talismans, and simple magical rituals. The inhabitants often cannot explain why it feels safer and more comfortable, only that it does.",
      8,
      {[UPKEEP_TYPES.people]: 12, [UPKEEP_TYPES.manaFlows]: 2, [UPKEEP_TYPES.veil]: 10},
      {[UPKEEP_TYPES.gold]: 2},
      ["production", "people", "manaFlows", "housing", "ritual"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.runedHouse, [
        buildings.aether.wardedHome,
        buildings.aether.dolmen,
      ]),
    ],
  },
  [buildings.aether.runedHouse]: {
    ...magicSuperstructure(
      buildings.aether.runedHouse,
      "Runed House",
      "A warded home and dolmen combined into a house marked with protective runes.",
      2,
      {[UPKEEP_TYPES.people]: 14, [UPKEEP_TYPES.manaFlows]: 12, [UPKEEP_TYPES.veil]: 18},
      {[UPKEEP_TYPES.gold]: 2},
      ["production", "people", "manaFlows", "housing", "ritual"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.coven, [
        buildings.aether.runedHouse,
        buildings.aether.runedHouse,
      ]),
    ],
  },
  [buildings.aether.coven]: magicSuperstructure(
    buildings.aether.coven,
    "Coven",
    "Two runed houses joined into a small organized magical community.",
    2,
    {[UPKEEP_TYPES.manaFlows]: 28, [UPKEEP_TYPES.veil]: 24, [UPKEEP_TYPES.death]: 4},
    {},
    ["production", "manaFlows", "ritual"],
  ),
  [buildings.aether.obelisk]: {
    ...magicBuilding(
      buildings.aether.obelisk,
      "Obelisk",
      "A focused mana producer with lower signature than early ritual houses.",
      18,
      {[UPKEEP_TYPES.manaFlows]: 18},
      {[UPKEEP_TYPES.gold]: 3},
      ["production", "manaFlows"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.embodimentStone, [
        buildings.aether.obelisk,
        buildings.aether.spiritHut,
      ]),
    ],
  },
  [buildings.aether.spiritHut]: {
    ...magicBuilding(
      buildings.aether.spiritHut,
      "Spirit Hut",
      "Converts part of nearby people requirements into mana requirements.",
      24,
      {[UPKEEP_TYPES.veil]: 16},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.manaFlows]: 2},
      ["support", "ritual"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.houseOfSpirits, [
        buildings.aether.spiritHut,
        buildings.aether.spiritHut,
        buildings.aether.spiritHut,
      ]),
      structureRule(buildings.aether.embodimentStone, [
        buildings.aether.obelisk,
        buildings.aether.spiritHut,
      ]),
      structureRule(buildings.aether.spiritTrap, [
        buildings.aether.spiritHut,
        buildings.aether.suppressionTotem,
      ]),
    ],
  },
  [buildings.aether.houseOfSpirits]: magicSuperstructure(
    buildings.aether.houseOfSpirits,
    "House of Spirits",
    "Three spirit huts combined into a stronger mana-for-people conversion center.",
    3,
    {[UPKEEP_TYPES.veil]: 42, [UPKEEP_TYPES.death]: 8},
    {[UPKEEP_TYPES.manaFlows]: 4},
    ["support", "ritual"],
  ),
  [buildings.aether.veilThinning]: magicBuilding(
    buildings.aether.veilThinning,
    "Veil Thinning",
    "A weak point where the spirit world leaks into reality, producing large mana and a large signature.",
    42,
    {[UPKEEP_TYPES.manaFlows]: 28, [UPKEEP_TYPES.veil]: 48, [UPKEEP_TYPES.death]: 6},
    {},
    ["production", "manaFlows", "visibility"],
  ),
  [buildings.aether.embodimentStone]: magicSuperstructure(
    buildings.aether.embodimentStone,
    "Embodiment Stone",
    "An obelisk and spirit hut combined to bind spirits into matter.",
    2,
    {[UPKEEP_TYPES.veil]: 18, [UPKEEP_TYPES.manaFlows]: 24, [UPKEEP_TYPES.death]: 8},
    {},
    ["support", "arcane"],
  ),
  [buildings.aether.golemBuilder]: magicBuilding(
    buildings.aether.golemBuilder,
    "Golem Builder",
    "Replaces all people requirements in radius with mana requirements.",
    32,
    {[UPKEEP_TYPES.manaFlows]: 26},
    {[UPKEEP_TYPES.manaFlows]: 5, [UPKEEP_TYPES.gold]: 3},
    ["support", "arcane"],
  ),
  [buildings.aether.suppressionTotem]: {
    ...magicBuilding(
      buildings.aether.suppressionTotem,
      "Suppression Totem",
      "Consumes mana to strongly reduce city signature while suppressing nearby production.",
      10,
      {[UPKEEP_TYPES.manaFlows]: 8, [UPKEEP_TYPES.death]: 22},
      {[UPKEEP_TYPES.manaFlows]: 5},
      ["visibility", "ritual"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.spiritTrap, [
        buildings.aether.spiritHut,
        buildings.aether.suppressionTotem,
      ]),
    ],
  },
  [buildings.aether.spiritTrap]: magicSuperstructure(
    buildings.aether.spiritTrap,
    "Spirit Trap",
    "A spirit hut and suppression totem combined into a dangerous mana trap.",
    2,
    {[UPKEEP_TYPES.manaFlows]: 30, [UPKEEP_TYPES.death]: 36},
    {},
    ["production", "manaFlows", "ritual"],
  ),
};
