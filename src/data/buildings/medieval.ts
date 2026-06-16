import type {Building} from "../../models/city/Building.ts";
import type {BuildingKeyword} from "../../models/city/Keywords.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import type {MultiHexStructureRule} from "../../models/city/MultiHexStructure.ts";
import {UPKEEP_TYPES, type UpkeepAmount} from "../../models/Upkeep.ts";
import {BUILDING_TYPES} from "../../models/city/BuildingTypes.ts";
import {buildings} from "../identificators/index.ts";

function building(
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
    vector: DEVELOPMENT_VECTORS.medieval,
    requiredUpkeep,
    requiredUpkeepDescription: {},
    trace,
    providedUpkeep,
    providedUpkeepDescription: {},
    adjacency: [],
    adjacencyDescription: "Not affected",
    description,
    keywords: ["medieval", ...keywords],
  };
}

function superstructure(
  id: string,
  name: string,
  description: string,
  size: number,
  providedUpkeep: UpkeepAmount = {},
  requiredUpkeep: UpkeepAmount = {},
  keywords: BuildingKeyword[] = [],
): Building {
  return {
    ...building(id, name, description, 0, providedUpkeep, requiredUpkeep, keywords),
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
    developerVector: DEVELOPMENT_VECTORS.medieval,
  };
}

export const medievalBuildings: {[key: string]: Building} = {
  [buildings.medieval.shelter]: {
    ...building(
      buildings.medieval.shelter,
      "Shelter",
      "A rough first home that makes organized foraging possible.",
      5,
      {[UPKEEP_TYPES.people]: 8},
      {},
      ["production", "people", "housing"],
    ),
    multiHexStructure: [
      structureRule(buildings.medieval.stalkerHut, [
        buildings.medieval.shelter,
        buildings.medieval.scrapCollectionPoint,
      ]),
    ],
  },
  [buildings.medieval.scrapCollectionPoint]: {
    ...building(
      buildings.medieval.scrapCollectionPoint,
      "Scrap Collection Point",
      "A sorting yard for salvaged tools, hollow trunks, fittings, and other early supplies.",
      12,
      {[UPKEEP_TYPES.gold]: 2},
      {[UPKEEP_TYPES.people]: 2},
      ["production", "gold", "salvage"],
    ),
    multiHexStructure: [
      structureRule(buildings.medieval.stalkerHut, [
        buildings.medieval.shelter,
        buildings.medieval.scrapCollectionPoint,
      ]),
    ],
  },
  [buildings.medieval.stalkerHut]: superstructure(
    buildings.medieval.stalkerHut,
    "Stalker Hut",
    "A shelter and scrap collection point combined into a base for stalkers.",
    2,
    {[UPKEEP_TYPES.people]: 5, [UPKEEP_TYPES.gold]: 3},
    {},
    ["production", "people", "gold", "salvage"],
  ),
  [buildings.medieval.toolShed]: {
    ...building(
      buildings.medieval.toolShed,
      "Tool Shed",
      "A cramped rack of repaired scrap tools sturdy enough for repeat work.",
      14,
      {[UPKEEP_TYPES.gold]: 4},
      {[UPKEEP_TYPES.people]: 2, [UPKEEP_TYPES.gold]: 1},
      ["production", "gold", "tools"],
    ),
    multiHexStructure: [
      structureRule(buildings.medieval.lumberjackHouse, [
        buildings.medieval.stalkerHut,
        buildings.medieval.toolShed,
      ]),
      structureRule(buildings.medieval.craftsmansHouse, [
        buildings.medieval.woodenHouse,
        buildings.medieval.toolShed,
      ]),
    ],
  },
  [buildings.medieval.lumberjackHouse]: superstructure(
    buildings.medieval.lumberjackHouse,
    "Lumberjack House",
    "A stalker hut and tool shed combined for reliable timber work.",
    2,
    {[UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 5},
    {},
    ["production", "people", "gold", "wood"],
  ),
  [buildings.medieval.farm]: {
    ...building(
      buildings.medieval.farm,
      "Farm",
      "A dependable food source that supports barns, stables, and later trade.",
      18,
      {[UPKEEP_TYPES.people]: 6, [UPKEEP_TYPES.gold]: 2},
      {[UPKEEP_TYPES.people]: 4},
      ["production", "people", "gold", "farm"],
    ),
    multiHexStructure: [
      structureRule(buildings.medieval.stable, [
        buildings.medieval.barn,
        buildings.medieval.farm,
      ]),
    ],
  },
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
    multiHexStructure: [
      structureRule(buildings.medieval.craftsmansHouse, [
        buildings.medieval.woodenHouse,
        buildings.medieval.toolShed,
      ]),
    ],
  },
  [buildings.medieval.craftsmansHouse]: superstructure(
    buildings.medieval.craftsmansHouse,
    "Craftsman's House",
    "A wooden house and tool shed that support woodworking and stoneworking.",
    2,
    {[UPKEEP_TYPES.people]: 8, [UPKEEP_TYPES.gold]: 5},
    {},
    ["production", "people", "gold", "craft"],
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
    multiHexStructure: [
      structureRule(buildings.medieval.engineersHouse, [
        buildings.medieval.workshop,
        buildings.medieval.stoneHouse,
      ]),
      structureRule(buildings.medieval.alchemicalLaboratory, [
        buildings.medieval.chemicalStorage,
        buildings.medieval.stoneHouse,
      ]),
    ],
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
      "A focused craft building that improves nearby production but disrupts mana work.",
      22,
      {[UPKEEP_TYPES.gold]: 7},
      {[UPKEEP_TYPES.people]: 3, [UPKEEP_TYPES.gold]: 3},
      ["production", "gold", "craft"],
    ),
    adjacencyDescription: "+25% production in adjacent buildings; -25% Mana production in adjacent buildings.",
    multiHexStructure: [
      structureRule(buildings.medieval.engineersHouse, [
        buildings.medieval.workshop,
        buildings.medieval.stoneHouse,
      ]),
    ],
  },
  [buildings.medieval.engineersHouse]: superstructure(
    buildings.medieval.engineersHouse,
    "Engineer's House",
    "A workshop and stone house combined into an engineering household.",
    2,
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
    multiHexStructure: [
      structureRule(buildings.medieval.stable, [
        buildings.medieval.barn,
        buildings.medieval.farm,
      ]),
    ],
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
    multiHexStructure: [
      structureRule(buildings.medieval.tradingPost, [
        buildings.medieval.shop,
        buildings.medieval.tradeStation,
      ]),
    ],
  },
  [buildings.medieval.stable]: superstructure(
    buildings.medieval.stable,
    "Stable",
    "A barn and farm organized around horses.",
    2,
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
    multiHexStructure: [
      structureRule(buildings.medieval.tradingPost, [
        buildings.medieval.shop,
        buildings.medieval.tradeStation,
      ]),
    ],
  },
  [buildings.medieval.tradingPost]: superstructure(
    buildings.medieval.tradingPost,
    "Trading Post",
    "A shop and trade station combined into caravan infrastructure.",
    2,
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
    multiHexStructure: [
      structureRule(buildings.medieval.alchemicalLaboratory, [
        buildings.medieval.chemicalStorage,
        buildings.medieval.stoneHouse,
      ]),
    ],
  },
  [buildings.medieval.alchemicalLaboratory]: superstructure(
    buildings.medieval.alchemicalLaboratory,
    "Alchemical Laboratory",
    "Chemical storage and stone housing arranged for gunpowder work.",
    2,
    {},
    {[UPKEEP_TYPES.people]: 4, [UPKEEP_TYPES.gold]: 5},
    ["infrastructure", "laboratory"],
  ),
};
