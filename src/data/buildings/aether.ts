import type {Building} from "../../models/city/Building.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../homogeneousValues/index.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";
import {createBuildingFactory} from "./buildingFactory.ts";

const {
  building: magicBuilding,
  superstructure: magicSuperstructure,
  structureRule,
  multiHexStructure,
} = createBuildingFactory({
  vector: DEVELOPMENT_VECTORS.aether,
  defaultKeywords: ["aether"],
});

const aetherBuildingsRaw: {[key: string]: Building} = {
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
    multiHexStructure: multiHexStructure(buildings.aether.dolmen, [
      structureRule(buildings.aether.shamanHut, [
        buildings.medieval.stalkerHut,
      ]),
      structureRule(buildings.aether.runedHouse, [
        buildings.aether.wardedHome,
      ]),
    ]),
  },
  [buildings.aether.shamanHut]: magicSuperstructure(
    buildings.aether.shamanHut,
    "Shaman Hut",
    "A dolmen and stalker hut combined into an early magical specialist dwelling.",
    26,
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
    multiHexStructure: multiHexStructure(buildings.aether.wardedHome, [
      structureRule(buildings.aether.runedHouse, [
        buildings.aether.dolmen,
      ]),
    ]),
  },
  [buildings.aether.runedHouse]: {
    ...magicSuperstructure(
      buildings.aether.runedHouse,
      "Runed House",
      "A warded home and dolmen combined into a house marked with protective runes.",
      24,
      {[UPKEEP_TYPES.people]: 14, [UPKEEP_TYPES.manaFlows]: 12, [UPKEEP_TYPES.veil]: 18},
      {[UPKEEP_TYPES.gold]: 2},
      ["production", "people", "manaFlows", "housing", "ritual"],
    ),
    multiHexStructure: multiHexStructure(buildings.aether.runedHouse, [
      structureRule(buildings.aether.coven, [
        buildings.aether.runedHouse,
      ]),
    ]),
  },
  [buildings.aether.coven]: magicSuperstructure(
    buildings.aether.coven,
    "Coven",
    "Two runed houses joined into a small organized magical community.",
    38,
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
    multiHexStructure: multiHexStructure(buildings.aether.obelisk, [
      structureRule(buildings.aether.embodimentStone, [
        buildings.aether.spiritHut,
      ]),
    ]),
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
    multiHexStructure: multiHexStructure(buildings.aether.spiritHut, [
      structureRule(buildings.aether.houseOfSpirits, [
        buildings.aether.spiritHut,
        buildings.aether.spiritHut,
      ]),
      structureRule(buildings.aether.embodimentStone, [
        buildings.aether.obelisk,
      ]),
      structureRule(buildings.aether.spiritTrap, [
        buildings.aether.suppressionTotem,
      ]),
    ]),
  },
  [buildings.aether.houseOfSpirits]: magicSuperstructure(
    buildings.aether.houseOfSpirits,
    "House of Spirits",
    "Three spirit huts combined into a stronger mana-for-people conversion center.",
    52,
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
    34,
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
    multiHexStructure: multiHexStructure(buildings.aether.suppressionTotem, [
      structureRule(buildings.aether.spiritTrap, [
        buildings.aether.spiritHut,
      ]),
    ]),
  },
  [buildings.aether.spiritTrap]: magicSuperstructure(
    buildings.aether.spiritTrap,
    "Spirit Trap",
    "A spirit hut and suppression totem combined into a dangerous mana trap.",
    30,
    {[UPKEEP_TYPES.manaFlows]: 30, [UPKEEP_TYPES.death]: 36},
    {},
    ["production", "manaFlows", "ritual"],
  ),
};

const aetherBuildingRequirements: Record<string, Requirement[]> = {
  [buildings.aether.dolmen]: [
    requires.technologyUnlocked(technologies.aether.wickedItems),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 1),
  ],
  [buildings.aether.shamanHut]: [
    requires.buildingExists(buildings.aether.dolmen),
    requires.buildingExists(buildings.medieval.stalkerHut),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
  ],
  [buildings.aether.wardedHome]: [
    requires.technologyUnlocked(technologies.aether.magicStones),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
  ],
  [buildings.aether.runedHouse]: [
    requires.buildingExists(buildings.aether.wardedHome),
    requires.buildingExists(buildings.aether.dolmen),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 2),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 1),
  ],
  [buildings.aether.coven]: [
    requires.buildingExists(buildings.aether.runedHouse),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 3),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
  ],
  [buildings.aether.obelisk]: [
    requires.technologyUnlocked(technologies.aether.mysticalCommand),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 2),
  ],
  [buildings.aether.spiritHut]: [
    requires.technologyUnlocked(technologies.aether.mysticalFriendship),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 3),
  ],
  [buildings.aether.houseOfSpirits]: [
    requires.buildingExists(buildings.aether.spiritHut),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
  ],
  [buildings.aether.veilThinning]: [
    requires.technologyUnlocked(technologies.aether.ancestorSpirits),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
  ],
  [buildings.aether.embodimentStone]: [
    requires.buildingExists(buildings.aether.obelisk),
    requires.buildingExists(buildings.aether.spiritHut),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceVeil, 4),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 3),
  ],
  [buildings.aether.golemBuilder]: [
    requires.technologyUnlocked(technologies.aether.livingClay),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 3),
  ],
  [buildings.aether.suppressionTotem]: [
    requires.technologyUnlocked(technologies.aether.mysticalHostility),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 2),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceManaFlows, 1),
  ],
  [buildings.aether.spiritTrap]: [
    requires.buildingExists(buildings.aether.spiritHut),
    requires.buildingExists(buildings.aether.suppressionTotem),
    requires.homogeneousValueAtLeast(HOMOGENEOUS_VALUE_IDS.resourceDeath, 3),
  ],
};

export const aetherBuildings: {[key: string]: Building} = Object.fromEntries(
  Object.values(aetherBuildingsRaw).map(building => [
    building.id,
    {
      ...building,
      requirements: aetherBuildingRequirements[building.id] ?? [],
    },
  ]),
);
