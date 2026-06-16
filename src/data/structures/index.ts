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
    id: "tech-research-campus",
    name: "Research Campus",
    vector: "tech",
    coreBuildingId: buildings.tech.machineShop,
    requiredAdjacentBuildingIds: [buildings.tech.fossilFuelPowerPlant],
    description: "A machine shop district with enough powered infrastructure to support engineering research.",
  },
  {
    id: "nature-cultivation-complex",
    name: "Cultivation Complex",
    vector: "nature",
    coreBuildingId: buildings.nature.mutationVat,
    requiredAdjacentBuildingIds: [buildings.nature.compostGrove],
    description: "A living production cluster where compost groves feed controlled mutation work.",
  },
  {
    id: "medieval-guild-district",
    name: "Guild District",
    vector: "medieval",
    coreBuildingId: buildings.medieval.market,
    requiredAdjacentBuildingIds: [buildings.medieval.workshop],
    description: "A dense civic market anchored by nearby craft work, ledgers, and guild labor.",
  },
  {
    id: "stalker-house-compound",
    name: "Stalker House Compound",
    vector: "medieval",
    coreBuildingId: buildings.medieval.shelter,
    requiredAdjacentBuildingIds: [buildings.medieval.scrapGatheringPost],
    description: "A shelter and scrap post that become a proper base for foragers and scavengers.",
  },
  {
    id: "forester-yard",
    name: "Forester Yard",
    vector: "medieval",
    coreBuildingId: buildings.medieval.stalkerHouse,
    requiredAdjacentBuildingIds: [buildings.medieval.toolShed],
    description: "A stalker house and tool shed organized around usable timber work.",
  },
  {
    id: "workshop-yard",
    name: "Workshop Yard",
    vector: "medieval",
    coreBuildingId: buildings.medieval.woodenHouse,
    requiredAdjacentBuildingIds: [buildings.medieval.toolShed],
    description: "A wooden house and tool shed that can support repeatable craft practice.",
  },
  {
    id: "herbalist-yard",
    name: "Herbalist Yard",
    vector: "nature",
    coreBuildingId: buildings.medieval.stalkerHouse,
    requiredAdjacentBuildingIds: [buildings.nature.wildGarden],
    description: "A forager base and wild garden that become the city's first herbal practice.",
  },
  {
    id: "farmstead",
    name: "Farmstead",
    vector: "nature",
    coreBuildingId: buildings.nature.field,
    requiredAdjacentBuildingIds: [buildings.medieval.woodenHouse],
    description: "A field and wooden house organized into the first stable farming surplus.",
  },
  {
    id: "shaman-yard",
    name: "Shaman Yard",
    vector: "aether",
    coreBuildingId: buildings.aether.dolmen,
    requiredAdjacentBuildingIds: [buildings.medieval.stalkerHouse],
    description: "A dolmen and scavenger household that can sustain early ritual practice.",
  },
  {
    id: "aether-rune-complex",
    name: "Rune Complex",
    vector: "aether",
    coreBuildingId: buildings.aether.runeScriptorium,
    requiredAdjacentBuildingIds: [buildings.aether.leylineWell],
    description: "A leyline-fed scriptorium district that can sustain repeatable arcane engineering.",
  },
];

export const STRUCTURES_BY_ID = Object.fromEntries(
  STRUCTURES.map(structure => [structure.id, structure]),
) as Record<string, StructureDefinition>;
