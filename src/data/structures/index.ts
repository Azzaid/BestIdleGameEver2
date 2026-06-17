import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import {buildings} from "../identificators/index.ts";

export type StructureDefinition = {
  id: string;
  name: string;
  vector: DevelopmentVectorKey;
  coreBuildingId: string;
  requiredAdjacentBuildingIds: string[];
  description?: string;
};

export const STRUCTURES: StructureDefinition[] = [
  {
    id: buildings.medieval.stalkerHut,
    name: "Stalker Hut",
    vector: "medieval",
    coreBuildingId: buildings.medieval.shelter,
    requiredAdjacentBuildingIds: [buildings.medieval.scrapCollectionPoint],
    description: "A shelter and scrap collection point combined into a base for stalkers.",
  },
  {
    id: buildings.medieval.lumberjackHouse,
    name: "Lumberjack House",
    vector: "medieval",
    coreBuildingId: buildings.medieval.stalkerHut,
    requiredAdjacentBuildingIds: [buildings.medieval.toolShed],
    description: "A stalker hut and tool shed combined for reliable timber work.",
  },
  {
    id: buildings.nature.herbalistHut,
    name: "Herbalist Hut",
    vector: "nature",
    coreBuildingId: buildings.medieval.stalkerHut,
    requiredAdjacentBuildingIds: [buildings.nature.wildGarden],
    description: "A stalker hut and wild garden combined into a place for cultivating and preparing gathered plants.",
  },
  {
    id: buildings.medieval.farm,
    name: "Farm",
    vector: "medieval",
    coreBuildingId: buildings.nature.field,
    requiredAdjacentBuildingIds: [buildings.medieval.woodenHouse],
    description: "A field and wooden house combined into the first major economic apex of the early game.",
  },
  {
    id: buildings.medieval.craftsmansHouse,
    name: "Craftsman's House",
    vector: "medieval",
    coreBuildingId: buildings.medieval.woodenHouse,
    requiredAdjacentBuildingIds: [buildings.medieval.toolShed],
    description: "A wooden house and tool shed that support woodworking and stoneworking.",
  },
  {
    id: buildings.medieval.engineersHouse,
    name: "Engineer's House",
    vector: "medieval",
    coreBuildingId: buildings.medieval.workshop,
    requiredAdjacentBuildingIds: [buildings.medieval.stoneHouse],
    description: "A workshop and stone house combined into an engineering household.",
  },
  {
    id: buildings.medieval.stable,
    name: "Stable",
    vector: "medieval",
    coreBuildingId: buildings.medieval.farm,
    requiredAdjacentBuildingIds: [buildings.medieval.barn],
    description: "A barn and farm organized around horses.",
  },
  {
    id: buildings.medieval.tradingStation,
    name: "Trading Station",
    vector: "medieval",
    coreBuildingId: buildings.medieval.shop,
    requiredAdjacentBuildingIds: [buildings.medieval.tradeStation],
    description: "A shop and trade station combined into caravan infrastructure.",
  },
  {
    id: buildings.medieval.alchemicalLaboratory,
    name: "Alchemical Laboratory",
    vector: "medieval",
    coreBuildingId: buildings.medieval.chemicalStorage,
    requiredAdjacentBuildingIds: [buildings.medieval.stoneHouse],
    description: "Chemical storage and stone housing arranged for gunpowder work.",
  },
  {
    id: buildings.aether.shamanHut,
    name: "Shaman Hut",
    vector: "aether",
    coreBuildingId: buildings.aether.dolmen,
    requiredAdjacentBuildingIds: [buildings.medieval.stalkerHut],
    description: "A dolmen and stalker hut combined into an early magical specialist dwelling.",
  },
  {
    id: buildings.aether.runedHouse,
    name: "Runed House",
    vector: "aether",
    coreBuildingId: buildings.aether.wardedHome,
    requiredAdjacentBuildingIds: [buildings.aether.dolmen],
    description: "A warded home and dolmen combined into a house marked with protective runes.",
  },
  {
    id: buildings.aether.coven,
    name: "Coven",
    vector: "aether",
    coreBuildingId: buildings.aether.runedHouse,
    requiredAdjacentBuildingIds: [buildings.aether.runedHouse],
    description: "Two runed houses joined into a small organized magical community.",
  },
  {
    id: buildings.aether.houseOfSpirits,
    name: "House of Spirits",
    vector: "aether",
    coreBuildingId: buildings.aether.spiritHut,
    requiredAdjacentBuildingIds: [buildings.aether.spiritHut, buildings.aether.spiritHut],
    description: "Three spirit huts combined into a stronger mana-for-people conversion center.",
  },
  {
    id: buildings.aether.embodimentStone,
    name: "Embodiment Stone",
    vector: "aether",
    coreBuildingId: buildings.aether.obelisk,
    requiredAdjacentBuildingIds: [buildings.aether.spiritHut],
    description: "An obelisk and spirit hut combined to bind spirits into matter.",
  },
  {
    id: buildings.aether.spiritTrap,
    name: "Spirit Trap",
    vector: "aether",
    coreBuildingId: buildings.aether.spiritHut,
    requiredAdjacentBuildingIds: [buildings.aether.suppressionTotem],
    description: "A spirit hut and suppression totem combined into a dangerous mana trap.",
  },
];

export const STRUCTURES_BY_ID = Object.fromEntries(
  STRUCTURES.map(structure => [structure.id, structure]),
) as Record<string, StructureDefinition>;
