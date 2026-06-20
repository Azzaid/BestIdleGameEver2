import type {Building} from "../../models/city/Building.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_TYPES} from "../../models/Upkeep.ts";
import {buildings, technologies} from "../identificators/index.ts";
import {requires} from "../requirements.ts";
import {createBuildingFactory} from "./buildingFactory.ts";

const {building, superstructure, structureRule, multiHexStructure} = createBuildingFactory({
  vector: DEVELOPMENT_VECTORS.medieval,
  defaultKeywords: ["medieval"],
});

const medievalBuildingsRaw: {[key: string]: Building} = {
  [buildings.medieval.shelter]: {
    ...building(
      buildings.medieval.shelter,
      "Shelter",
      "A rough first home that makes organized foraging possible.",
      4,
      {[UPKEEP_TYPES.people]: 3},
      {},
      ["production", "people", "housing"],
    ),
    multiHexStructure: multiHexStructure(buildings.medieval.shelter, [
      structureRule(buildings.medieval.stalkerHut, [
        buildings.medieval.scrapCollectionPoint,
      ]),
    ]),
  },
  [buildings.medieval.scrapCollectionPoint]: {
    ...building(
      buildings.medieval.scrapCollectionPoint,
      "Scrap Collection Point",
      "A sorting yard for salvaged tools, hollow trunks, fittings, and other early supplies.",
      2,
      {[UPKEEP_TYPES.gold]: 1},
      {[UPKEEP_TYPES.people]: 2},
      ["production", "gold", "scavenger"],
    ),
    multiHexStructure: multiHexStructure(buildings.medieval.scrapCollectionPoint, [
      structureRule(buildings.medieval.stalkerHut, [
        buildings.medieval.shelter,
      ]),
    ]),
  },
  [buildings.medieval.stalkerHut]: superstructure(
    buildings.medieval.stalkerHut,
    "Stalker Hut",
    "A shelter and scrap collection point combined into a base for stalkers.",
    5,
    {[UPKEEP_TYPES.people]: 5, [UPKEEP_TYPES.gold]: 3},
    {},
    ["production", "people", "gold", "scavenger"],
  ),
  [buildings.medieval.toolShed]: {
    ...building(
      buildings.medieval.toolShed,
      "Tool Shed",
      "A cramped rack of repaired scrap tools sturdy enough for repeat work.",
      3,
      {[UPKEEP_TYPES.gold]: 3},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 1},
      ["production", "gold", "tools"],
    ),
    multiHexStructure: multiHexStructure(buildings.medieval.toolShed, [
      structureRule(buildings.medieval.lumberjackHouse, [
        buildings.medieval.stalkerHut,
      ]),
      structureRule(buildings.medieval.craftsmansHouse, [
        buildings.medieval.woodenHouse,
      ]),
    ]),
  },
  [buildings.medieval.lumberjackHouse]: superstructure(
    buildings.medieval.lumberjackHouse,
    "Lumberjack House",
    "A stalker hut and tool shed combined for reliable timber work.",
    16,
    {[UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 5},
    {},
    ["production", "people", "gold", "wood", "timberwork"],
  ),
  [buildings.medieval.farm]: superstructure(
    buildings.medieval.farm,
    "Farm",
    "A field and wooden house combined into the first major economic apex of the early game.",
    20,
    {[UPKEEP_TYPES.people]: 6, [UPKEEP_TYPES.plants]: 9, [UPKEEP_TYPES.gold]: 2},
    {},
    ["production", "people", "plants", "gold", "farm"],
  ),
  [buildings.medieval.woodenHouse]: {
    ...building(
      buildings.medieval.woodenHouse,
      "Wooden House",
      "Real walls, a dry roof, and enough stability to grow the population.",
      10,
      {[UPKEEP_TYPES.people]: 14},
      {[UPKEEP_TYPES.gold]: 2},
      ["production", "people", "wood", "housing"],
    ),
    multiHexStructure: multiHexStructure(buildings.medieval.woodenHouse, [
      structureRule(buildings.medieval.farm, [
        buildings.nature.field,
      ]),
      structureRule(buildings.medieval.craftsmansHouse, [
        buildings.medieval.toolShed,
      ]),
    ]),
  },
  [buildings.medieval.craftsmansHouse]: superstructure(
    buildings.medieval.craftsmansHouse,
    "Craftsman's House",
    "A wooden house and tool shed that support woodworking and stoneworking.",
    18,
    {[UPKEEP_TYPES.people]: 8, [UPKEEP_TYPES.gold]: 5},
    {},
    ["production", "people", "gold", "craft", "woodWorking", "stoneWorking"],
  ),
  [buildings.medieval.market]: building(
    buildings.medieval.market,
    "Market",
    "A trading and social center where merchants, labor, favors, salvage, and coin become one economy.",
    16,
    {[UPKEEP_TYPES.gold]: 6},
    {[UPKEEP_TYPES.people]: 3},
    ["production", "gold", "market"],
  ),
  [buildings.medieval.stoneHouse]: {
    ...building(
      buildings.medieval.stoneHouse,
      "Stone House",
      "Durable housing that supports people and gold while keeping city signature lower than wood.",
      8,
      {[UPKEEP_TYPES.people]: 12, [UPKEEP_TYPES.gold]: 3},
      {[UPKEEP_TYPES.gold]: 2},
      ["production", "people", "gold", "housing"],
    ),
    multiHexStructure: multiHexStructure(buildings.medieval.stoneHouse, [
      structureRule(buildings.medieval.engineersHouse, [
        buildings.medieval.workshop,
      ]),
      structureRule(buildings.medieval.alchemicalLaboratory, [
        buildings.medieval.chemicalStorage,
      ]),
    ]),
  },
  [buildings.medieval.university]: building(
    buildings.medieval.university,
    "University",
    "A civic center for natural philosophy once enough stone housing exists.",
    26,
    {},
    {[UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 5},
    ["infrastructure", "craft"],
  ),
  [buildings.medieval.workshop]: {
    ...building(
      buildings.medieval.workshop,
    "Workshop",
    "A focused craft building that improves nearby production but disrupts Aether work.",
      22,
      {[UPKEEP_TYPES.gold]: 7},
      {[UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 3},
      ["production", "gold", "craft"],
    ),
    adjacencyDescription: "+25% production in adjacent buildings; -25% Aether production in adjacent buildings.",
    multiHexStructure: multiHexStructure(buildings.medieval.workshop, [
      structureRule(buildings.medieval.engineersHouse, [
        buildings.medieval.stoneHouse,
      ]),
    ]),
  },
  [buildings.medieval.engineersHouse]: superstructure(
    buildings.medieval.engineersHouse,
    "Engineer's House",
    "A workshop and stone house combined into an engineering household.",
    24,
    {[UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 10},
    {},
    ["production", "people", "gold", "craft"],
  ),
  [buildings.medieval.barracks]: building(
    buildings.medieval.barracks,
    "Barracks",
    "Consumes gold to send patrols outside the city and reduce city signature.",
    20,
    {},
    {[UPKEEP_TYPES.gold]: 4},
    ["defense", "visibility"],
  ),
  [buildings.medieval.barn]: {
    ...building(
      buildings.medieval.barn,
      "Barn",
      "Reduces people requirements of adjacent buildings.",
      12,
      {},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 1},
      ["support", "farm"],
    ),
    adjacencyDescription: "Adjacent buildings require fewer People.",
    multiHexStructure: multiHexStructure(buildings.medieval.barn, [
      structureRule(buildings.medieval.stable, [
        buildings.medieval.farm,
      ]),
    ]),
  },
  [buildings.medieval.tradeStation]: {
    ...building(
      buildings.medieval.tradeStation,
      "Trade Station",
      "Extends the reach of adjacency bonuses and opens the way to organized trade.",
      18,
      {},
      {[UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 3},
      ["support", "market"],
    ),
    adjacencyDescription: "Adjacency bonuses affect buildings at +1 range.",
    multiHexStructure: multiHexStructure(buildings.medieval.tradeStation, [
      structureRule(buildings.medieval.tradingStation, [
        buildings.medieval.shop,
      ]),
    ]),
  },
  [buildings.medieval.stable]: superstructure(
    buildings.medieval.stable,
    "Stable",
    "A barn and farm organized around horses.",
    18,
    {},
    {},
    ["support", "farm"],
  ),
  [buildings.medieval.shop]: {
    ...building(
      buildings.medieval.shop,
      "Shop",
      "A dedicated commercial building that produces gold.",
      16,
      {[UPKEEP_TYPES.gold]: 6},
      {[UPKEEP_TYPES.people]: 3},
      ["production", "gold", "market"],
    ),
    multiHexStructure: multiHexStructure(buildings.medieval.shop, [
      structureRule(buildings.medieval.tradingStation, [
        buildings.medieval.tradeStation,
      ]),
    ]),
  },
  [buildings.medieval.tradingStation]: superstructure(
    buildings.medieval.tradingStation,
    "Trading Station",
    "A shop and trade station combined into caravan infrastructure.",
    24,
    {[UPKEEP_TYPES.gold]: 8},
    {},
    ["production", "gold", "market"],
  ),
  [buildings.medieval.chemicalStorage]: {
    ...building(
      buildings.medieval.chemicalStorage,
      "Chemical Storage",
      "A careful stockpile for reactive ingredients needed by alchemy.",
      24,
      {},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 4},
      ["infrastructure", "laboratory"],
    ),
    multiHexStructure: multiHexStructure(buildings.medieval.chemicalStorage, [
      structureRule(buildings.medieval.alchemicalLaboratory, [
        buildings.medieval.stoneHouse,
      ]),
    ]),
  },
  [buildings.medieval.alchemicalLaboratory]: superstructure(
    buildings.medieval.alchemicalLaboratory,
    "Alchemical Laboratory",
    "Chemical storage and stone housing arranged for gunpowder work.",
    28,
    {},
    {[UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 5},
    ["infrastructure", "laboratory"],
  ),
};

const medievalBuildingRequirements: Record<string, Requirement[]> = {
  [buildings.medieval.scrapCollectionPoint]: [
    requires.technologyUnlocked(technologies.medieval.foraging),
  ],
  [buildings.medieval.stalkerHut]: [
    requires.buildingExists(buildings.medieval.shelter),
    requires.buildingExists(buildings.medieval.scrapCollectionPoint),
  ],
  [buildings.medieval.toolShed]: [
    requires.technologyUnlocked(technologies.medieval.scrapTools),
  ],
  [buildings.medieval.lumberjackHouse]: [
    requires.buildingExists(buildings.medieval.toolShed),
    requires.buildingExists(buildings.medieval.stalkerHut),
  ],
  [buildings.medieval.woodenHouse]: [
    requires.technologyUnlocked(technologies.medieval.timberProcessing),
  ],
  [buildings.medieval.farm]: [
    requires.buildingExists(buildings.nature.field),
    requires.buildingExists(buildings.medieval.woodenHouse),
  ],
  [buildings.medieval.market]: [
    requires.buildingExists(buildings.medieval.farm),
  ],
  [buildings.medieval.craftsmansHouse]: [
    requires.buildingExists(buildings.medieval.woodenHouse),
    requires.buildingExists(buildings.medieval.toolShed),
  ],
  [buildings.medieval.stoneHouse]: [
    requires.technologyUnlocked(technologies.medieval.stoneworking),
  ],
  [buildings.medieval.university]: [
    requires.technologyUnlocked(technologies.medieval.stoneworking),
    requires.buildingExists(buildings.medieval.stoneHouse),
  ],
  [buildings.medieval.workshop]: [
    requires.technologyUnlocked(technologies.medieval.engineering),
  ],
  [buildings.medieval.engineersHouse]: [
    requires.buildingExists(buildings.medieval.workshop),
    requires.buildingExists(buildings.medieval.stoneHouse),
  ],
  [buildings.medieval.barracks]: [
    requires.technologyUnlocked(technologies.medieval.fortification),
  ],
  [buildings.medieval.barn]: [
    requires.technologyUnlocked(technologies.medieval.animalHusbandry),
  ],
  [buildings.medieval.stable]: [
    requires.buildingExists(buildings.medieval.barn),
    requires.buildingExists(buildings.medieval.farm),
  ],
  [buildings.medieval.tradeStation]: [
    requires.technologyUnlocked(technologies.medieval.horses),
  ],
  [buildings.medieval.shop]: [
    requires.technologyUnlocked(technologies.medieval.trade),
  ],
  [buildings.medieval.tradingStation]: [
    requires.buildingExists(buildings.medieval.shop),
    requires.buildingExists(buildings.medieval.tradeStation),
  ],
  [buildings.medieval.chemicalStorage]: [
    requires.technologyUnlocked(technologies.medieval.naturalPhilosophy),
  ],
  [buildings.medieval.alchemicalLaboratory]: [
    requires.buildingExists(buildings.medieval.chemicalStorage),
    requires.buildingExists(buildings.medieval.stoneHouse),
  ],
};

export const medievalBuildings: {[key: string]: Building} = Object.fromEntries(
  Object.values(medievalBuildingsRaw).map(building => [
    building.id,
    {
      ...building,
      requirements: medievalBuildingRequirements[building.id] ?? [],
    },
  ]),
);
