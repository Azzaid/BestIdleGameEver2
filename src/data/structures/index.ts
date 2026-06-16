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
    coreBuildingId: buildings.medieval.marketSquare,
    requiredAdjacentBuildingIds: [buildings.medieval.homesteadRow],
    description: "A dense civic market anchored by nearby homes, workshops, and guild labor.",
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
