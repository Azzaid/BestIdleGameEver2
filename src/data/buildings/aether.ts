import type {Building} from "../../models/city/Building.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import type {MultiHexStructureRule} from "../../models/city/MultiHexStructure.ts";
import {UPKEEP_TYPES, type UpkeepAmount} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import {buildings} from "../identificators/index.ts";

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
    requiredUpkeep,
    requiredUpkeepDescription: {},
    trace,
    providedUpkeep,
    providedUpkeepDescription: {},
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
      {},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 2},
      ["ritual"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.shrine, [
        buildings.medieval.stoneHouse,
        buildings.aether.dolmen,
      ]),
    ],
  },
  [buildings.aether.shrine]: magicSuperstructure(
    buildings.aether.shrine,
    "Shrine",
    "A stone house and dolmen combined into a mana-producing shrine.",
    2,
    {[UPKEEP_TYPES.mana]: 5},
    {},
    ["production", "mana", "ritual"],
  ),
  [buildings.aether.monastery]: magicSuperstructure(
    buildings.aether.monastery,
    "Monastery",
    "A shrine and two stone houses combined into an increased mana center.",
    3,
    {[UPKEEP_TYPES.mana]: 12},
    {},
    ["production", "mana", "ritual"],
  ),
  [buildings.aether.obelisk]: {
    ...magicBuilding(
      buildings.aether.obelisk,
      "Obelisk",
      "A focused mana producer with lower signature than a shrine.",
      18,
      {[UPKEEP_TYPES.mana]: 8},
      {[UPKEEP_TYPES.gold]: 3},
      ["production", "mana"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.bindingStone, [
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
      {},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.mana]: 2},
      ["support", "ritual"],
    ),
    multiHexStructure: [
      structureRule(buildings.aether.houseOfSpirits, [
        buildings.aether.spiritHut,
        buildings.aether.spiritHut,
        buildings.aether.spiritHut,
      ]),
      structureRule(buildings.aether.bindingStone, [
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
    {},
    {[UPKEEP_TYPES.mana]: 4},
    ["support", "ritual"],
  ),
  [buildings.aether.veilThinning]: magicBuilding(
    buildings.aether.veilThinning,
    "Veil Thinning",
    "A weak point where the spirit world leaks into reality, producing large mana and a large signature.",
    42,
    {[UPKEEP_TYPES.mana]: 16},
    {},
    ["production", "mana", "visibility"],
  ),
  [buildings.aether.bindingStone]: magicSuperstructure(
    buildings.aether.bindingStone,
    "Binding Stone",
    "An obelisk and spirit hut combined to bind living clay.",
    2,
    {},
    {},
    ["support", "arcane"],
  ),
  [buildings.aether.golemWorkshop]: magicBuilding(
    buildings.aether.golemWorkshop,
    "Golem Workshop",
    "Replaces all people requirements in radius with mana requirements.",
    32,
    {},
    {[UPKEEP_TYPES.mana]: 5, [UPKEEP_TYPES.gold]: 3},
    ["support", "arcane"],
  ),
  [buildings.aether.suppressionTotem]: {
    ...magicBuilding(
      buildings.aether.suppressionTotem,
      "Suppression Totem",
      "Consumes mana to strongly reduce city signature while suppressing nearby production.",
      10,
      {},
      {[UPKEEP_TYPES.mana]: 5},
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
    {[UPKEEP_TYPES.mana]: 14},
    {},
    ["production", "mana", "ritual"],
  ),
};
